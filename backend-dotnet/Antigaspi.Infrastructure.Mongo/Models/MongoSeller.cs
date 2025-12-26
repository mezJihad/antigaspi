using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Antigaspi.Infrastructure.Mongo.Models;

public class MongoSeller
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    [BsonRepresentation(BsonType.String)]
    public Guid UserId { get; set; }

    public required string StoreName { get; set; }
    
    public required MongoAddress Address { get; set; }
    
    public required string Description { get; set; }
    
    [BsonRepresentation(BsonType.String)]
    public required string Status { get; set; } // Store Enum as String for readability
    
    public string? RejectionReason { get; set; }
}

public class MongoAddress
{
    public required string Street { get; set; }
    public required string City { get; set; }
    public required string ZipCode { get; set; }
    public required string Country { get; set; }
}
