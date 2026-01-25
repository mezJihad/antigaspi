using Antigaspi.Domain.Entities;

namespace Antigaspi.Api.Dtos;

// We can use these records or just return Entities for MVP if they are clean enough.
// Detailed DTOs are better for long term.

public record OfferResponse(
    Guid Id,
    Guid SellerId,
    string Title,
    string Description,
    decimal Price,
    string PriceCurrency,
    decimal OriginalPrice,
    string OriginalPriceCurrency,
    string PictureUrl,
    DateTime StartDate,
    DateTime? EndDate,
    DateTime ExpirationDate,
    string Category,
    string Status,
    string ShopName,
    string City,
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
        offer.StartDate,
        offer.EndDate,
        offer.ExpirationDate,
        offer.Category.ToString(),
        offer.Status.ToString(),
        offer.Seller?.StoreName ?? "Inconnu",
        offer.Seller?.Address?.City ?? "Inconnu",
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
    double? Latitude,
    double? Longitude,
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
        seller.Address.Latitude,
        seller.Address.Longitude,
        seller.Description,
        seller.Status.ToString(),
        seller.RejectionReason
    );
}
