using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Amazon.Lambda.Core;
using Amazon.Lambda.S3Events;
using Amazon.S3;
using Amazon.S3.Util;
using OfficeOpenXml;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace CSVParser
{
    public class Function
    {
        private const string UrlColumnName = "Link";

        IAmazonS3 S3Client { get; set; }
        IAmazonDynamoDB DynamoDbClient { get; set; }

        /// <summary>
        /// Default constructor. This constructor is used by Lambda to construct the instance. When invoked in a Lambda environment
        /// the AWS credentials will come from the IAM role associated with the function and the AWS region will be set to the
        /// region the Lambda function is executed in.
        /// </summary>
        public Function()
        {
            S3Client = new AmazonS3Client();
            DynamoDbClient = new AmazonDynamoDBClient();

        }

        /// <summary>
        /// Constructs an instance with a preconfigured S3 client. This can be used for testing the outside of the Lambda environment.
        /// </summary>
        /// <param name="s3Client"></param>
        public Function(IAmazonS3 s3Client, IAmazonDynamoDB dynamoDbClient)
        {
            S3Client = s3Client;
            DynamoDbClient = dynamoDbClient;
        }
        
        /// <summary>
        /// This method is called for every Lambda invocation. This method takes in an S3 event object and can be used 
        /// to respond to S3 notifications.
        /// </summary>
        /// <param name="evnt"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        public async Task<string> FunctionHandler(S3Event evnt, ILambdaContext context)
        {
            //LambdaLogger.Log($"Event: {JsonSerializer.Serialize(evnt)}");
            var s3Event = evnt.Records?[0].S3;
            if(s3Event == null)
            {
                return null;
            }

            try
            {
                //LambdaLogger.Log($"S3 Bucket: {JsonSerializer.Serialize(s3Event.Bucket)}");
                //LambdaLogger.Log($"S3 Object: {JsonSerializer.Serialize(s3Event.Object)}");
                
                var response = await S3Client.GetObjectAsync(s3Event.Bucket.Name, s3Event.Object.Key);
                LambdaLogger.Log($"Response [{response.BucketName}]\n");
                LambdaLogger.Log($"Stream.Type [{response.GetType()}]\n");
                LambdaLogger.Log($"Size [{response.ContentLength}]\n");
                using (var responseStream = response.ResponseStream)
                using(var memStream = new MemoryStream())
                {
                    responseStream.CopyTo(memStream);
                    LambdaLogger.Log($"Stream.Position [{memStream.Position}]\n");
                    LambdaLogger.Log($"Stream.CanRead [{memStream.CanRead}[\n");

                    using (var chdgWorkbook = new ExcelPackage(memStream))
                    {                    
                        
                        var table = Table.LoadTable(DynamoDbClient, "urls");
                        LambdaLogger.Log($"Table: {table.TableName}");
                        var batchWrite = table.CreateBatchWrite();

                        string title = response.Metadata["x-amz-meta-title"]; // Assume you have "title" as medata added to the object.
                        string contentType = response.Headers["Content-Type"];

                        //LambdaLogger.Log($"Object metadata, Title: {title}");
                        //LambdaLogger.Log($"Content type: {contentType}");

                        var workSheets = chdgWorkbook.Workbook.Worksheets;

                        var columns = GetColumnList(workSheets);

                        var documentMap = new Dictionary<string, Document>();

                        foreach (var sheet in workSheets)
                        {
                            LambdaLogger.Log($"Processing Sheet: {sheet.Name}");
                            var columnLookup = GetColumnLookup(columns, sheet);

                            for (var rowNumber = 1; rowNumber < sheet.Dimension.Rows; rowNumber++)
                            {
                                var document = new Document();

                                var url = "";

                                foreach (var columnToAdd in columnLookup)
                                {
                                    var value = GetCellContents(sheet, rowNumber, columnToAdd.Value);

                                    var destinationKey = columnToAdd.Key;
                                    if (destinationKey.Equals(UrlColumnName, StringComparison.OrdinalIgnoreCase))
                                    {
                                        destinationKey = "url";
                                        url = value;
                                    }

                                    document[destinationKey] = value;
                                }

                                if (!string.IsNullOrEmpty(url))
                                {
                                    documentMap[url] = document;
                                }
                                else
                                {
                                    LambdaLogger.Log($"Missing URL: {document.ToJsonPretty()}");
                                }
                            }
                        }

                        foreach (var doc in documentMap.Values)
                        {
                            batchWrite.AddDocumentToPut(doc);
                        }

                        await batchWrite.ExecuteAsync();

                    }
                }
                

                return response.Headers.ContentType;
            }
            catch(Exception e)
            {
                context.Logger.LogLine($"Error getting object {s3Event.Object.Key} from bucket {s3Event.Bucket.Name}. Make sure they exist and your bucket is in the same region as this function.");
                context.Logger.LogLine(e.Message);
                context.Logger.LogLine(e.StackTrace);
                throw;
            }
        }

        private IDictionary<string, int> GetColumnLookup(IEnumerable<string> validColumns, ExcelWorksheet worksheet)
        {
            var columnCount = worksheet.Dimension.Columns;

            var columns = new Dictionary<string, int>();

            for(var i = 0; i < columnCount; i++)
            {
                var columnHeader = GetCellContents(worksheet, 0, i);

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

            LambdaLogger.Log($"Master Sheet Name [{masterSheet.Name}]\n");
            LambdaLogger.Log($"Master Sheet Max Row [{masterSheet.Dimension.Rows}]\n");
            LambdaLogger.Log($"Master Sheet Max Column [{masterSheet.Dimension.Columns}]\n");
            LambdaLogger.Log($"Master Sheet Cell Address [{masterSheet.Cells.Address}]\n");

            var columnCount = masterSheet.Dimension.Columns;

            var columns = new List<string>();
            
            for(var i = 0; i < columnCount; i++)
            {
                columns.Add(GetCellContents(masterSheet, 0, i));
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
                LambdaLogger.Log($"Cell Lookup Errored on Sheet: [{sheet.Name}] Row: {row}] Column: [{column}]\n");
                throw;
            }
        }
    }
}
