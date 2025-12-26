using Antigaspi.Domain.Entities;
using Antigaspi.Domain.Enums;
using Antigaspi.Domain.ValueObjects;
using Antigaspi.Infrastructure.Mongo.Models;

namespace Antigaspi.Infrastructure.Mongo.Mappers;

public static class SellerMapper
{
    public static MongoSeller ToMongo(Seller seller)
    {
        return new MongoSeller
        {
            Id = seller.Id,
            UserId = seller.UserId,
            StoreName = seller.StoreName,
            Address = new MongoAddress
            {
                Street = seller.Address.Street,
                City = seller.Address.City,
                ZipCode = seller.Address.ZipCode,
                Country = seller.Address.Country
            },
            Description = seller.Description,
            Status = seller.Status.ToString(),
            RejectionReason = seller.RejectionReason
        };
    }

    public static Seller ToDomain(MongoSeller mongoSeller)
    {
        // Enum parsing
        if (!Enum.TryParse<SellerStatus>(mongoSeller.Status, out var status))
        {
            status = SellerStatus.PENDING; // Default fallback or throw?
        }

        var address = new Address(
            mongoSeller.Address.Street, 
            mongoSeller.Address.City, 
            mongoSeller.Address.ZipCode, 
            mongoSeller.Address.Country
        );

        return new Seller(
            mongoSeller.UserId,
            mongoSeller.StoreName,
            address,
            mongoSeller.Description,
            mongoSeller.Id,
            status,
            mongoSeller.RejectionReason
        );
    }
}
