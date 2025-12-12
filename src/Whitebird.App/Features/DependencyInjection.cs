using Microsoft.Extensions.DependencyInjection;
using Whitebird.App.Features.Asset.Interfaces;
using Whitebird.App.Features.Asset.Service;
using Whitebird.App.Features.Category.Interfaces;
using Whitebird.App.Features.Category.Service;
using Whitebird.App.Features.Employee.Interfaces;
using Whitebird.App.Features.Employee.Service;
using Whitebird.App.Features.AssetTransactions.Interfaces;
using Whitebird.App.Features.AssetTransactions.Service;
using Whitebird.App.Features.Auth.Interfaces;
using Whitebird.App.Features.Auth.Service;

namespace Whitebird.App.Features
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAssetService, AssetService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IEmployeeService, EmployeeService>();
            services.AddScoped<IAssetTransactionsService, AssetTransactionsService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IEmailService, EmailService>();
            return services;
        }
    }
}