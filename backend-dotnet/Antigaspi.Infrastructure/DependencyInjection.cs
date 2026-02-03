using Antigaspi.Application.Repositories;
using Antigaspi.Infrastructure.Persistence;
using Antigaspi.Infrastructure.Persistence.Repositories;
using Antigaspi.Infrastructure.Authentication;
using Antigaspi.Application.Common.Interfaces.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Antigaspi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DB Context
        // DB Context
        services.AddDbContext<AntigaspiDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AntigaspiDbContext).Assembly.FullName)));

        // Repositories
        services.AddScoped<ISellerRepository, SqlSellerRepository>();
        services.AddScoped<IOfferRepository, SqlOfferRepository>();
        services.AddScoped<IUserRepository, SqlUserRepository>();
        services.AddScoped<ICityRepository, SqlCityRepository>();


        // Authentication
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.Configure<Antigaspi.Infrastructure.Authentication.JwtSettings>(configuration.GetSection(Antigaspi.Infrastructure.Authentication.JwtSettings.SectionName));

        // File Storage
        services.AddHttpContextAccessor();
        services.AddScoped<Antigaspi.Application.Common.Interfaces.IFileStorageService, Antigaspi.Infrastructure.Services.FileStorage.LocalFileStorageService>();

        services.AddHttpClient<Antigaspi.Infrastructure.Services.BrevoApiEmailService>();
        services.AddScoped<Antigaspi.Application.Common.Interfaces.IEmailService, Antigaspi.Infrastructure.Services.BrevoApiEmailService>();

        return services;
    }
}
