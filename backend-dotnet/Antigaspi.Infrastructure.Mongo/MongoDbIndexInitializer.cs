using MongoDB.Driver;
using Antigaspi.Infrastructure.Mongo.Configuration;
using Antigaspi.Infrastructure.Mongo.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Antigaspi.Infrastructure.Mongo;

public class MongoDbIndexInitializer : IHostedService
{
    private readonly IMongoClient _mongoClient;
    private readonly MongoDbSettings _settings;

    public MongoDbIndexInitializer(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        _mongoClient = mongoClient;
        _settings = settings.Value;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var database = _mongoClient.GetDatabase(_settings.DatabaseName);
        var sellers = database.GetCollection<MongoSeller>("sellers");
        var offers = database.GetCollection<MongoOffer>("offers");

        // Sellers Indexes
        await sellers.Indexes.CreateOneAsync(
            new CreateIndexModel<MongoSeller>(Builders<MongoSeller>.IndexKeys.Ascending(s => s.UserId)),
            cancellationToken: cancellationToken);
        
        await sellers.Indexes.CreateOneAsync(
            new CreateIndexModel<MongoSeller>(Builders<MongoSeller>.IndexKeys.Ascending(s => s.Status)),
            cancellationToken: cancellationToken);

        // Offers Indexes
        await offers.Indexes.CreateOneAsync(
            new CreateIndexModel<MongoOffer>(Builders<MongoOffer>.IndexKeys.Ascending(o => o.SellerId)),
            cancellationToken: cancellationToken);

        await offers.Indexes.CreateOneAsync(
            new CreateIndexModel<MongoOffer>(Builders<MongoOffer>.IndexKeys.Ascending(o => o.Status)),
            cancellationToken: cancellationToken);

        await offers.Indexes.CreateOneAsync(
            new CreateIndexModel<MongoOffer>(Builders<MongoOffer>.IndexKeys.Ascending(o => o.ExpirationDate)),
            cancellationToken: cancellationToken);
            
         // Price index for filtering (if needed later)
         // Note: Price is nested object, so index on Price.Amount
         await offers.Indexes.CreateOneAsync(
            new CreateIndexModel<MongoOffer>(Builders<MongoOffer>.IndexKeys.Ascending("Price.Amount")),
            cancellationToken: cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
