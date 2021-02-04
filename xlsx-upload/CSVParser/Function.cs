using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Amazon.Lambda.Core;
using Amazon.Lambda.S3Events;
using Amazon.S3;
using Amazon.S3.Util;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace CSVParser
{
    public class Function
    {
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
            var s3Event = evnt.Records?[0].S3;
            if(s3Event == null)
            {
                return null;
            }

            try
            {
                var response = await S3Client.GetObjectAsync(s3Event.Bucket.Name, s3Event.Object.Key);

                using (var responseStream = response.ResponseStream)
                using (var reader = new StreamReader(responseStream))
                {
                    var table = Table.LoadTable(DynamoDbClient, "urls");
                    var batchWrite = table.CreateBatchWrite();

                    string title = response.Metadata["x-amz-meta-title"]; // Assume you have "title" as medata added to the object.
                    string contentType = response.Headers["Content-Type"];
                    Console.WriteLine("Object metadata, Title: {0}", title);
                    Console.WriteLine("Content type: {0}", contentType);

                    string line = await reader.ReadLineAsync();

                    if (line == null)
                    {
                        return null;
                    }

                    var header = line.Split(',').ToList();

                    var headerLookup = header.ToDictionary(x => x, x => header.IndexOf(x));
                    
                    line = await reader.ReadLineAsync();


                    var parsedItems = new List<WriteRequest>();

                    while (line != null)
                    {
                        line = await reader.ReadLineAsync();
                        var item = new Document();

                        var splitLine = line.Split(',');
                        var parsedLine = headerLookup.ToDictionary(x => x.Key, x => splitLine[headerLookup[x.Key]]);
                        foreach (var key in headerLookup.Keys)
                        {
                            item[key] = splitLine[headerLookup[key]];
                        }

                        batchWrite.AddDocumentToPut(item);
                    }

                    await batchWrite.ExecuteAsync();

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
    }
}
