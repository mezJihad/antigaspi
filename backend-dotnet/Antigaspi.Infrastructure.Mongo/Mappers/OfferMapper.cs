using Antigaspi.Domain.Entities;
using Antigaspi.Domain.Enums;
using Antigaspi.Domain.ValueObjects;
using Antigaspi.Infrastructure.Mongo.Models;
using System.Reflection;

namespace Antigaspi.Infrastructure.Mongo.Mappers;

public static class OfferMapper
{
    public static MongoOffer ToMongo(Offer offer)
    {
        return new MongoOffer
        {
            Id = offer.Id,
            SellerId = offer.SellerId,
            Title = offer.Title,
            Description = offer.Description,
            Price = new MongoMoney { Amount = offer.Price.Amount, Currency = offer.Price.Currency },
            OriginalPrice = new MongoMoney { Amount = offer.OriginalPrice.Amount, Currency = offer.OriginalPrice.Currency },
            PictureUrl = offer.PictureUrl,
            ExpirationDate = offer.ExpirationDate,
            Status = offer.Status.ToString(),
            StatusHistory = offer.StatusHistory.Select(h => new MongoOfferStatusEntry
            {
                Status = h.Status.ToString(),
                ChangedBy = h.ChangedBy,
                ChangedAt = h.ChangedAt,
                Reason = h.Reason
            }).ToList()
        };
    }

    public static Offer ToDomain(MongoOffer mongoOffer)
    {
        if (!Enum.TryParse<OfferStatus>(mongoOffer.Status, out var status))
        {
            status = OfferStatus.DRAFT;
        }

        var price = new Money(mongoOffer.Price.Amount, mongoOffer.Price.Currency);
        var originalPrice = new Money(mongoOffer.OriginalPrice.Amount, mongoOffer.OriginalPrice.Currency);

        // Offer constructor handles simple properties, but StatusHistory is a private collection.
        // We need to use reflection or expose a simplified constructor for ORMs/Persistence to rehydrate the state.
        // Clean Architecture purists accept internal constructors or reflection for this boundary.
        // Or simpler: The public constructor sets clean state, but we need to rehydrate history.

        var offer = new Offer(
            mongoOffer.SellerId,
            mongoOffer.Title,
            mongoOffer.Description,
            price,
            originalPrice,
            mongoOffer.PictureUrl,
            mongoOffer.ExpirationDate,
            mongoOffer.Id,
            status
        );
        
        // Rehydrate History via Reflection to keep Domain encapsulation strict
        var historyField = typeof(Offer).GetField("_statusHistory", BindingFlags.NonPublic | BindingFlags.Instance);
        if (historyField != null)
        {
            var historyEntries = mongoOffer.StatusHistory.Select(h => 
            {
                 Enum.TryParse<OfferStatus>(h.Status, out var hStatus);
                 return new OfferStatusEntry(hStatus, h.ChangedBy, h.ChangedAt, h.Reason);
            }).ToList();
            
            historyField.SetValue(offer, historyEntries);
        }

        return offer;
    }
}
