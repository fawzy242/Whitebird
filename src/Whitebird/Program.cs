using System.Text;
using Mapster;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Whitebird.App.Features;
using Whitebird.Domain.Features.Asset.Entities;
using Whitebird.Domain.Features.Asset.View;
using Whitebird.Domain.Features.AssetTransactions.Entities;
using Whitebird.Domain.Features.AssetTransactions.View;
using Whitebird.Domain.Features.Category.Entities;
using Whitebird.Domain.Features.Category.View;
using Whitebird.Domain.Features.Employee.Entities;
using Whitebird.Domain.Features.Employee.View;
using Whitebird.Domain.Common.Auth;
using Whitebird.Infra.Features.Common;
using Whitebird.App.Features.Auth.Service;
using Whitebird.App.Features.Auth.Interfaces;
using Whitebird.Infra.Features.Auth;
using Whitebird.Infra.Features.Reports;
using Whitebird.App.Features.Reports.Interfaces;
using Whitebird.App.Features.Reports.Service;
using Whitebird.Infra.Features.AssetTransactions;
using Whitebird.Infra.Features.Asset;

var builder = WebApplication.CreateBuilder(args);

// 1. BASIC SERVICES
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. JWT AUTHENTICATION
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "Whitebird",
        ValidAudience = jwtSettings["Audience"] ?? "WhitebirdUsers",
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 3. SWAGGER
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Whitebird API",
        Version = "v1",
        Description = "Asset Management System API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 4. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                                ?? new[] { "https://yourdomain.com" };

            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// 5. APPLICATION SERVICES
builder.Services.AddApplicationServices();
builder.Services.AddGenericRepositories();
builder.Services.AddMapster();

// 6. AUTH SERVICES
builder.Services.AddScoped<IAuthReps, AuthReps>();
builder.Services.AddScoped<IAssetReps, AssetReps>();
builder.Services.AddScoped<IAssetTransactionsReps, AssetTransactionsReps>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IReportsReps, ReportsReps>();
builder.Services.AddScoped<IReportsService, ReportsService>();

// Configure Mapster mappings
TypeAdapterConfig.GlobalSettings.Default.PreserveReference(true);
TypeAdapterConfig.GlobalSettings.Default.IgnoreNullValues(true);

// Asset mappings
TypeAdapterConfig<AssetEntity, AssetDetailViewModel>.NewConfig()
    .Map(dest => dest.CategoryName, src => "Unknown")
    .Map(dest => dest.CurrentHolderName, src => "Unknown");

TypeAdapterConfig<AssetEntity, AssetListViewModel>.NewConfig()
    .Map(dest => dest.CategoryName, src => "Unknown")
    .Map(dest => dest.CurrentHolderName, src => "Unknown");

// Category mappings
TypeAdapterConfig<CategoryEntity, CategoryDetailViewModel>.NewConfig()
    .Map(dest => dest.CategoryId, src => src.CategoryId)
    .Map(dest => dest.CategoryName, src => src.CategoryName)
    .Map(dest => dest.Description, src => src.Description)
    .Map(dest => dest.IsActive, src => src.IsActive);

TypeAdapterConfig<CategoryEntity, CategoryListViewModel>.NewConfig()
    .Map(dest => dest.CategoryId, src => src.CategoryId)
    .Map(dest => dest.CategoryName, src => src.CategoryName)
    .Map(dest => dest.IsActive, src => src.IsActive);

TypeAdapterConfig<CategoryCreateViewModel, CategoryEntity>.NewConfig()
    .Map(dest => dest.CategoryName, src => src.CategoryName)
    .Map(dest => dest.Description, src => src.Description)
    .Ignore(dest => dest.CategoryId)
    .Ignore(dest => dest.IsActive)
    .Ignore(dest => dest.CreatedDate)
    .Ignore(dest => dest.CreatedBy);

TypeAdapterConfig<CategoryUpdateViewModel, CategoryEntity>.NewConfig()
    .Map(dest => dest.CategoryName, src => src.CategoryName)
    .Map(dest => dest.Description, src => src.Description)
    .Map(dest => dest.IsActive, src => src.IsActive)
    .Ignore(dest => dest.CategoryId)
    .Ignore(dest => dest.CreatedDate)
    .Ignore(dest => dest.CreatedBy);

// Employee mappings
TypeAdapterConfig<EmployeeEntity, EmployeeDetailViewModel>.NewConfig()
    .Map(dest => dest.EmployeeId, src => src.EmployeeId)
    .Map(dest => dest.EmployeeCode, src => src.EmployeeCode)
    .Map(dest => dest.FullName, src => src.FullName)
    .Map(dest => dest.Department, src => src.Department)
    .Map(dest => dest.Position, src => src.Position)
    .Map(dest => dest.PhoneNumber, src => src.PhoneNumber)
    .Map(dest => dest.Email, src => src.Email)
    .Map(dest => dest.IsActive, src => src.IsActive);

TypeAdapterConfig<EmployeeEntity, EmployeeListViewModel>.NewConfig()
    .Map(dest => dest.EmployeeId, src => src.EmployeeId)
    .Map(dest => dest.EmployeeCode, src => src.EmployeeCode)
    .Map(dest => dest.FullName, src => src.FullName)
    .Map(dest => dest.Department, src => src.Department)
    .Map(dest => dest.Position, src => src.Position)
    .Map(dest => dest.IsActive, src => src.IsActive);

TypeAdapterConfig<EmployeeCreateViewModel, EmployeeEntity>.NewConfig()
    .Map(dest => dest.FullName, src => src.FullName)
    .Map(dest => dest.Department, src => src.Department)
    .Map(dest => dest.Position, src => src.Position)
    .Map(dest => dest.PhoneNumber, src => src.PhoneNumber)
    .Map(dest => dest.Email, src => src.Email)
    .Ignore(dest => dest.EmployeeId)
    .Ignore(dest => dest.EmployeeCode)
    .Ignore(dest => dest.IsActive)
    .Ignore(dest => dest.CreatedDate)
    .Ignore(dest => dest.CreatedBy);

TypeAdapterConfig<EmployeeUpdateViewModel, EmployeeEntity>.NewConfig()
    .Map(dest => dest.FullName, src => src.FullName)
    .Map(dest => dest.Department, src => src.Department)
    .Map(dest => dest.Position, src => src.Position)
    .Map(dest => dest.PhoneNumber, src => src.PhoneNumber)
    .Map(dest => dest.Email, src => src.Email)
    .Map(dest => dest.IsActive, src => src.IsActive)
    .Ignore(dest => dest.EmployeeId)
    .Ignore(dest => dest.EmployeeCode)
    .Ignore(dest => dest.CreatedDate)
    .Ignore(dest => dest.CreatedBy);

// Asset Transactions mappings
TypeAdapterConfig<AssetTransactionsEntity, AssetTransactionsDetailViewModel>.NewConfig()
    .Map(dest => dest.AssetTransactionsId, src => src.AssetTransactionsId)
    .Map(dest => dest.AssetId, src => src.AssetId)
    .Map(dest => dest.FromEmployeeId, src => src.FromEmployeeId)
    .Map(dest => dest.ToEmployeeId, src => src.ToEmployeeId)
    .Map(dest => dest.TransactionDate, src => src.TransactionDate)
    .Map(dest => dest.Notes, src => src.Notes)
    .Map(dest => dest.Status, src => src.Status);

TypeAdapterConfig<AssetTransactionsEntity, AssetTransactionsListViewModel>.NewConfig()
    .Map(dest => dest.AssetTransactionsId, src => src.AssetTransactionsId)
    .Map(dest => dest.AssetId, src => src.AssetId)
    .Map(dest => dest.AssetCode, src => "Unknown")
    .Map(dest => dest.AssetName, src => "Unknown")
    .Map(dest => dest.FromEmployeeName, src => "Unknown")
    .Map(dest => dest.ToEmployeeName, src => "Unknown")
    .Map(dest => dest.TransactionDate, src => src.TransactionDate)
    .Map(dest => dest.Status, src => src.Status);

TypeAdapterConfig<AssetTransactionsCreateViewModel, AssetTransactionsEntity>.NewConfig()
    .Map(dest => dest.AssetId, src => src.AssetId)
    .Map(dest => dest.FromEmployeeId, src => src.FromEmployeeId)
    .Map(dest => dest.ToEmployeeId, src => src.ToEmployeeId)
    .Map(dest => dest.Notes, src => src.Notes)
    .Map(dest => dest.Status, src => src.Status)
    .Ignore(dest => dest.AssetTransactionsId)
    .Ignore(dest => dest.TransactionDate)
    .Ignore(dest => dest.CreatedDate)
    .Ignore(dest => dest.CreatedBy);

TypeAdapterConfig<AssetTransactionsUpdateViewModel, AssetTransactionsEntity>.NewConfig()
    .Map(dest => dest.AssetId, src => src.AssetId)
    .Map(dest => dest.FromEmployeeId, src => src.FromEmployeeId)
    .Map(dest => dest.ToEmployeeId, src => src.ToEmployeeId)
    .Map(dest => dest.TransactionDate, src => src.TransactionDate)
    .Map(dest => dest.Notes, src => src.Notes)
    .Map(dest => dest.Status, src => src.Status)
    .Ignore(dest => dest.AssetTransactionsId)
    .Ignore(dest => dest.CreatedDate)
    .Ignore(dest => dest.CreatedBy);

// 7. LOGGING
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));

// 8. HTTP CONTEXT ACCESSOR
builder.Services.AddHttpContextAccessor();

// 9. API BEHAVIOR CONFIGURATION
builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true;
});

var app = builder.Build();

// ========== MIDDLEWARE PIPELINE ==========

// 1. EXCEPTION HANDLING
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// 2. HTTPS REDIRECTION
app.UseHttpsRedirection();

// 3. STATIC FILES & DEFAULT FILES
app.UseDefaultFiles();
app.UseStaticFiles();

// 4. ROUTING
app.UseRouting();

// 5. CORS
app.UseCors("AllowSpecificOrigins");

// 6. AUTHENTICATION & AUTHORIZATION
app.UseAuthentication();
app.UseAuthorization();

// 7. SWAGGER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Whitebird API V1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "Whitebird API Documentation";
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
    });
}

// 8. HEALTH CHECK ENDPOINT
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName,
    service = "Asset Management System",
    database = "Connected"
}));

// 9. CONTROLLERS
app.MapControllers();

// 10. SPA FALLBACK
app.MapFallbackToFile("index.html");

app.Run();