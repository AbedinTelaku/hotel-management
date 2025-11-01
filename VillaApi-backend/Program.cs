using Azure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Net;
using System.Reflection;
using System.Text;
using VillaApi;
using VillaApi.Hubs;
using VillaApi.Utils;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Host.UseSerilog((context, configuration) => configuration.ReadFrom.Configuration(context.Configuration));


builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyDatabase")));

// Register repositories
builder.Services.AddScoped<VillaApi.IRepository.IMessageRepository, VillaApi.Repository.MessageRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IUserRepository, VillaApi.Repository.UserRepository>();
builder.Services.AddScoped<VillaApi.IRepository.ISuggestionCarNameRepository, VillaApi.Repository.SuggestionCarNameRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IRoomRepository, VillaApi.Repository.RoomRepository>();
builder.Services.AddScoped<VillaApi.IRepository.ISupplyAndSellRepository, VillaApi.Repository.SupplyAndSellRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IRoomTypeRepository, VillaApi.Repository.RoomTypeRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IPaymentRepository, VillaApi.Repository.PaymentRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IRoomPriceRepository, VillaApi.Repository.RoomPriceRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IRoomModelRepository, VillaApi.Repository.RoomModelRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IProductRepository, VillaApi.Repository.ProductRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IProductCategoryRepository, VillaApi.Repository.ProductCategoryRepository>();
builder.Services.AddScoped<VillaApi.IRepository.IPrivilegeRepository, VillaApi.Repository.PrivilegeRepository>();

// Register services
builder.Services.AddScoped<VillaApi.MyMessages>();

builder.Services.AddTransient<ErrorHandlerMiddleware>();

builder.Services.AddAuthentication()
        .AddJwtBearer(options =>
        {
             options.SaveToken = true;
            options.AutomaticRefreshInterval = TimeSpan.FromMinutes(60);
            options.TokenValidationParameters = new TokenValidationParameters()
            {
                RequireExpirationTime = true,
                ClockSkew = TimeSpan.FromMinutes(5), // Reduced from 500 minutes to 5 minutes
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = TokenKeys._myIssuer,
                ValidAudience = TokenKeys._myAudience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(TokenKeys._mySecret)
                ),
                ValidateActor = false,
                ValidateTokenReplay = false
            };
            
            // Add event handlers for debugging
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    Console.WriteLine("Token validated successfully");
                    return Task.CompletedTask;
                },
                OnChallenge = context =>
                {
                    Console.WriteLine($"Challenge: {context.Error} - {context.ErrorDescription}");
                    return Task.CompletedTask;
                }
            };
        });


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
            // Allow any origin during development (including LAN IPs like 192.168.x.x)
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
});

builder.Services.AddControllers() // Ensure AddControllers is called after AddCors
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    return new OkObjectResult(new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = context.ModelState.Values.FirstOrDefault()?.Errors?.FirstOrDefault()?.ErrorMessage ?? "",
                        Data = context.ModelState.Values.FirstOrDefault()?.Errors?.ToList()
                    });
                };
            });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "JWTToken_Auth_API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\"",
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

});

builder.Services.AddHttpContextAccessor();

builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseMiddleware<ErrorHandlerMiddleware>();

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapHub<RoomsHub>("roomshub");

// Seed product categories, products, and extra room type
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MyDbContext>();
    await SeedProductCategories.SeedCategories(context);
    await SeedProducts.SeedProductsData(context);
    await SeedExtraRoomType.SeedExtraRoomTypeAsync(context);
}

app.Run();
