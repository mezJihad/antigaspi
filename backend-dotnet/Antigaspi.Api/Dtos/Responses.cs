using Antigaspi.Domain.Entities;

namespace Antigaspi.Api.Dtos;

// We can use these records or just return Entities for MVP if they are clean enough.
// Detailed DTOs are better for long term.

public record OfferResponse(
    Guid Id,
    Guid SellerId,
    string Title,
    string Description,
    decimal PriceAmount,
    string PriceCurrency,
    decimal OriginalPriceAmount,
    string OriginalPriceCurrency,
    string PictureUrl,
    DateTime ExpirationDate,
    string Status,
    List<OfferStatusEntryResponse> StatusHistory
)
{
    public static OfferResponse FromEntity(Offer offer) => new(
        offer.Id,
        offer.SellerId,
        offer.Title,
        offer.Description,
        offer.Price.Amount,
        offer.Price.Currency,
        offer.OriginalPrice.Amount,
        offer.OriginalPrice.Currency,
        offer.PictureUrl,
        offer.ExpirationDate,
        offer.Status.ToString(),
        offer.StatusHistory.Select(h => new OfferStatusEntryResponse(h.Status.ToString(), h.ChangedBy, h.ChangedAt, h.Reason)).ToList()
    );
}

public record OfferStatusEntryResponse(string Status, Guid? ChangedBy, DateTime ChangedAt, string? Reason);

public record SellerResponse(
    Guid Id,
    Guid UserId,
    string StoreName,
    string Street,
    string City,
    string ZipCode,
    string Country,
    string Description,
    string Status,
    string? RejectionReason
)
{
    public static SellerResponse FromEntity(Seller seller) => new(
        seller.Id,
        seller.UserId,
        seller.StoreName,
        seller.Address.Street,
        seller.Address.City,
        seller.Address.ZipCode,
        seller.Address.Country,
        seller.Description,
        seller.Status.ToString(),
        seller.RejectionReason
    );
}
