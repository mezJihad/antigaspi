using MongoDB.Driver;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Infrastructure.Mongo.Configuration;
using Antigaspi.Infrastructure.Mongo.Mappers;
using Antigaspi.Infrastructure.Mongo.Models;
using Microsoft.Extensions.Options;

namespace Antigaspi.Infrastructure.Mongo.Repositories;

public class MongoSellerRepository : ISellerRepository
{
    private readonly IMongoCollection<MongoSeller> _collection;

    public MongoSellerRepository(IOptions<MongoDbSettings> settings, IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _collection = database.GetCollection<MongoSeller>("sellers");
    }

    public async Task<Seller?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<MongoSeller>.Filter.Eq(s => s.Id, id);
        var mongoSeller = await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
        
        return mongoSeller == null ? null : SellerMapper.ToDomain(mongoSeller);
    }

    public async Task<Seller?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<MongoSeller>.Filter.Eq(s => s.UserId, userId);
        var mongoSeller = await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);

        return mongoSeller == null ? null : SellerMapper.ToDomain(mongoSeller);
    }

    public async Task AddAsync(Seller seller, CancellationToken cancellationToken = default)
    {
        var mongoSeller = SellerMapper.ToMongo(seller);
        await _collection.InsertOneAsync(mongoSeller, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(Seller seller, CancellationToken cancellationToken = default)
    {
        var mongoSeller = SellerMapper.ToMongo(seller);
        var filter = Builders<MongoSeller>.Filter.Eq(s => s.Id, seller.Id);
        await _collection.ReplaceOneAsync(filter, mongoSeller, cancellationToken: cancellationToken);
    }
}
