using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Antigaspi.Infrastructure.Mongo.Models;

public class MongoOffer
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    [BsonRepresentation(BsonType.String)]
    public Guid SellerId { get; set; }

    public required string Title { get; set; }
    public required string Description { get; set; }
    
    public required MongoMoney Price { get; set; }
    public required MongoMoney OriginalPrice { get; set; }
    
    public required string PictureUrl { get; set; }
    
    public DateTime ExpirationDate { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public required string Status { get; set; }

    public List<MongoOfferStatusEntry> StatusHistory { get; set; } = new();
}

public class MongoMoney
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
}

public class MongoOfferStatusEntry
{
    [BsonRepresentation(BsonType.String)]
    public required string Status { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public Guid? ChangedBy { get; set; }
    
    public DateTime ChangedAt { get; set; }
    
    public string? Reason { get; set; }
}
