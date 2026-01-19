using Antigaspi.Application.Repositories;
using Antigaspi.Infrastructure.Persistence;
using Antigaspi.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Antigaspi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DB Context
        services.AddDbContext<AntigaspiDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AntigaspiDbContext).Assembly.FullName)));

        // Repositories
        services.AddScoped<ISellerRepository, SqlSellerRepository>();
        services.AddScoped<IOfferRepository, SqlOfferRepository>();

        return services;
    }
}
