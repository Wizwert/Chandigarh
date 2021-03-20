using Amazon.DynamoDBv2;
using Amazon.S3;
using Amazon.IdentityManagement;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace xlsx_upload
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDefaultAWSOptions(Configuration.GetAWSOptions());
            services.AddAWSService<IAmazonS3>();
            services.AddAWSService<IAmazonDynamoDB>();
            services.AddAWSService<IAmazonIdentityManagementService>();
            services.AddHostedService<ExcelUploadService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
        }
    }
}
