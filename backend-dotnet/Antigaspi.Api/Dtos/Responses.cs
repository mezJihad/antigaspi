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
    List<OfferStatusEntryResponse> StatusHistory,
    SellerAddressResponse? SellerAddress,
    OfferSellerResponse? Seller, 
    string SourceLanguage,
    string OfferType
)
{
    public static OfferResponse FromEntity(Offer offer) => new(
        offer.Id,
        offer.SellerId,
        offer.Product?.Title ?? "Produit supprimé", // Handle null if necessary
        offer.Product?.Description ?? "",
        offer.Price.Amount,
        offer.Price.Currency,
        offer.Product?.OriginalPrice.Amount ?? 0,
        offer.Product?.OriginalPrice.Currency ?? "MAD",
        offer.Product?.PictureUrl ?? "",
        offer.StartDate,
        offer.EndDate,
        offer.ExpirationDate,
        offer.Product?.Category.ToString() ?? "Other",
        offer.Status.ToString(),
        offer.Seller?.StoreName ?? "Inconnu",
        offer.Seller?.Address?.City ?? "Inconnu",
        offer.StatusHistory.Select(h => new OfferStatusEntryResponse(h.Status.ToString(), h.ChangedBy, h.ChangedAt, h.Reason)).ToList(),
        offer.Seller?.Address != null ? new SellerAddressResponse(
            offer.Seller.Address.Street,
            offer.Seller.Address.City,
            offer.Seller.Address.ZipCode,
            offer.Seller.Address.Latitude,
            offer.Seller.Address.Longitude
        ) : null,
        offer.Seller != null ? new OfferSellerResponse(
            offer.Seller.StoreName,
            new SellerAddressResponse(
                offer.Seller.Address.Street,
                offer.Seller.Address.City,
                offer.Seller.Address.ZipCode,
                offer.Seller.Address.Latitude,
                offer.Seller.Address.Longitude
            )
        ) : null,
        offer.SourceLanguage,
        offer.Type.ToString()
    );
}

public record OfferSellerResponse(string StoreName, SellerAddressResponse Address);

public record SellerAddressResponse(string Street, string City, string ZipCode, double? Latitude, double? Longitude);

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
    string? RejectionReason,
    string SourceLanguage
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
        seller.RejectionReason,
        seller.SourceLanguage
    );
}
