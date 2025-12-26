using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Antigaspi.Application.Repositories;
using Antigaspi.Infrastructure.Mongo.Configuration;
using Antigaspi.Infrastructure.Mongo.Repositories;
using MongoDB.Driver;

namespace Antigaspi.Infrastructure.Mongo;

public static class DependencyInjection
{
    public static IServiceCollection AddMongoInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Settings
        services.Configure<MongoDbSettings>(options =>
        {
            options.ConnectionString = configuration["MONGODB_URI"] ?? "mongodb://localhost:27017";
            options.DatabaseName = configuration["MONGODB_DB_NAME"] ?? "antigaspi";
        });

        // Client
        services.AddSingleton<IMongoClient>(sp =>
        {
            var config = configuration["MONGODB_URI"] ?? "mongodb://localhost:27017";
            return new MongoClient(config);
        });

        // Repositories
        services.AddScoped<ISellerRepository, MongoSellerRepository>();
        services.AddScoped<IOfferRepository, MongoOfferRepository>();

        // Index Initializer
        services.AddHostedService<MongoDbIndexInitializer>();

        return services;
    }
}
