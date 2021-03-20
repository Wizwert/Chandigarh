using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.IdentityManagement;
using Amazon.Runtime.Internal;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;

namespace xlsx_upload
{
    public class ExcelUploadService : IHostedService
    {
        private const string UrlColumnName = "Link";

        IAmazonS3 S3Client { get; set; }
        IAmazonDynamoDB DynamoDbClient { get; set; }
        IAmazonIdentityManagementService IAMService { get; set; }
        ILogger<ExcelUploadService> Logger { get; set; }


        public ExcelUploadService(IAmazonS3 s3Client, IAmazonDynamoDB dynamoDbClient, ILogger<ExcelUploadService> logger, IAmazonIdentityManagementService iamService)
        {
            S3Client = s3Client;
            DynamoDbClient = dynamoDbClient;
            IAMService = iamService;
            Logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            return Upload(@"C:\ChandigarhFurnitureAuctionTracking.xlsx", cancellationToken);
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }


        public async Task Upload(string inputLocation, CancellationToken cancellationToken)
        {
            try
            {

                using var chdgWorkbook = new ExcelPackage(new FileInfo(inputLocation));

                var table = Table.LoadTable(DynamoDbClient, "urls");
                Logger.LogInformation($"Table: {table.TableName}");

                var batchWrite = table.CreateBatchWrite();

                var workSheets = chdgWorkbook.Workbook.Worksheets;

                var columns = GetColumnList(workSheets);               

                foreach(var sheet in workSheets)
                {
                    var documentMap = new Dictionary<string, Document>();
                    cancellationToken.ThrowIfCancellationRequested();
                    Logger.LogInformation($"Processing Sheet: {sheet.Name}");
                    Logger.LogInformation("Building drawing Lookup...");
                    var drawingLookup = sheet.Drawings.ToDictionary(x => x.As.Picture.From.Row, x => x.As.Picture.Image);
                    Logger.LogInformation("Building column Lookup...");
                    var columnLookup = GetColumnLookup(columns, sheet);

                    for(var rowNumber = 1; rowNumber < sheet.Dimension.Rows; rowNumber++)
                    {
                        var document = new Document();

                        var url = "";

                        foreach(var columnToAdd in columnLookup)
                        {
                            var value = GetCellContents(sheet, rowNumber, columnToAdd.Value);

                            var destinationKey = columnToAdd.Key;
                            if(destinationKey.Equals(UrlColumnName, StringComparison.OrdinalIgnoreCase))
                            {
                                destinationKey = "url";
                                url = value;
                            }

                            document[destinationKey] = value;
                        }

                        if(!string.IsNullOrEmpty(url))
                        {
                            documentMap[url] = document;

                            if(drawingLookup.TryGetValue(rowNumber, out var image))
                            {
                                var doesUrlAlreadyHaveImage = await DoesFileExist(url, cancellationToken);

                                using var stream = new MemoryStream();
                                image.Save(stream, ImageFormat.Png);
                                var request = new PutObjectRequest
                                {
                                    BucketName = "chdg-url-images",
                                    Key = url,
                                    InputStream = stream,
                                    ContentType = "image/png",
                                    CannedACL = S3CannedACL.PublicRead
                                };

                                await S3Client.PutObjectAsync(request, cancellationToken);
                            }
                        }
                        else
                        {
                            Logger.LogWarning($"Missing URL: {document.ToJsonPretty()}");
                        }

                        if(rowNumber % 10 == 0)
                        {
                            Logger.LogInformation("Processed {rowNumber} rows", rowNumber);
                            foreach(var doc in documentMap.Values)
                            {
                                batchWrite.AddDocumentToPut(doc);
                            }

                            Logger.LogInformation("Writing Items to Dynamo DB");
                            await batchWrite.ExecuteAsync(cancellationToken);

                            documentMap.Clear();
                        }
                    }


                }



                Logger.LogInformation("All done!");
            }
            catch(Exception e)
            {
                Logger.LogError(e.Message);
                Logger.LogError(e.StackTrace);
                throw;
            }
        }

        private async Task<bool> DoesFileExist(string url, CancellationToken cancellationToken)
        {
            try
            {
                var response = await S3Client.GetObjectMetadataAsync("chdg-url-images", url, cancellationToken);

                return true;
            }
            catch(AmazonS3Exception ex)
            {
                if(ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return false;
                }

                //status wasn't not found, so throw the exception
                throw;
            }
        }

        private IDictionary<string, int> GetColumnLookup(IEnumerable<string> validColumns, ExcelWorksheet worksheet)
        {
            var columnCount = worksheet.Dimension.Columns;

            var columns = new Dictionary<string, int>();

            for(var i = 1; i <= columnCount; i++)
            {
                var columnHeader = GetCellContents(worksheet, 1, i);
                if(string.IsNullOrEmpty(columnHeader))
                {
                    continue;
                }

                if(!validColumns.Any(x => x.Equals(columnHeader, StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                columns.Add(columnHeader, i);
            }

            return columns;
        }

        private IEnumerable<string> GetColumnList(ExcelWorksheets workSheets)
        {
            var masterSheet = workSheets.FirstOrDefault(x => x.Name.Equals("Masterlist", StringComparison.OrdinalIgnoreCase)) ?? workSheets.First();

            Logger.LogInformation($"Master Sheet Name [{masterSheet.Name}]\n");
            Logger.LogInformation($"Master Sheet Max Row [{masterSheet.Dimension.Rows}]\n");
            Logger.LogInformation($"Master Sheet Max Column [{masterSheet.Dimension.Columns}]\n");
            Logger.LogInformation($"Master Sheet Cell Address [{masterSheet.Cells.Address}]\n");

            var columnCount = masterSheet.Dimension.Columns;

            var columns = new List<string>();

            for(var i = 1; i <= columnCount; i++)
            {
                columns.Add(GetCellContents(masterSheet, 1, i));
            }

            return columns;
        }

        private string GetCellContents(ExcelWorksheet sheet, int row, int column)
        {
            try
            {
                return sheet.Cells[row, column].Text;
            }
            catch(ArgumentException)
            {
                Logger.LogInformation($"Cell Lookup Errored on Sheet: [{sheet.Name}] Row: {row}] Column: [{column}]\n");
                throw;
            }
        }
    }
}
