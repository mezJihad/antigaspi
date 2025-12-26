using MongoDB.Driver;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Infrastructure.Mongo.Configuration;
using Antigaspi.Infrastructure.Mongo.Mappers;
using Antigaspi.Infrastructure.Mongo.Models;
using Microsoft.Extensions.Options;

namespace Antigaspi.Infrastructure.Mongo.Repositories;

public class MongoOfferRepository : IOfferRepository
{
    private readonly IMongoCollection<MongoOffer> _collection;

    public MongoOfferRepository(IOptions<MongoDbSettings> settings, IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _collection = database.GetCollection<MongoOffer>("offers");
    }

    public async Task<Offer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<MongoOffer>.Filter.Eq(o => o.Id, id);
        var mongoOffer = await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
        
        return mongoOffer == null ? null : OfferMapper.ToDomain(mongoOffer);
    }

    public async Task AddAsync(Offer offer, CancellationToken cancellationToken = default)
    {
        var mongoOffer = OfferMapper.ToMongo(offer);
        await _collection.InsertOneAsync(mongoOffer, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(Offer offer, CancellationToken cancellationToken = default)
    {
        var mongoOffer = OfferMapper.ToMongo(offer);
        var filter = Builders<MongoOffer>.Filter.Eq(o => o.Id, offer.Id);
        await _collection.ReplaceOneAsync(filter, mongoOffer, cancellationToken: cancellationToken);
    }
}
