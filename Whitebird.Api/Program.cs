using System.Net;

namespace Quantix.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ✅ Service untuk controller (API)
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // ✅ Swagger hanya aktif di development
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // ⚠️ Certificate validation (ini boleh tetap, tapi hati-hati di production)
            ServicePointManager.ServerCertificateValidationCallback +=
                (sender, certificate, chain, sslPolicyErrors) => true;

            // ✅ Tambahan penting agar index.html bisa ditampilkan
            app.UseDefaultFiles();  // cari file default seperti index.html
            app.UseStaticFiles();   // izinkan akses ke file di wwwroot

            app.UseHttpsRedirection();
            app.UseAuthorization();

            // ✅ Routing API
            app.MapControllers();

            app.Run();
        }
    }
}
