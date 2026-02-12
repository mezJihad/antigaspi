namespace Antigaspi.Api.Dtos;

using Microsoft.AspNetCore.Http;

public record RegisterSellerRequest(
    Guid UserId,
    string StoreName,
    string Street,
    string City,
    string? ZipCode,
    string Description,
    double? Latitude,
    double? Longitude,
    string? SourceLanguage
);

public record UpdateSellerRequest(
    string StoreName,
    string Street,
    string City,
    string? ZipCode,
    string Description,
    double? Latitude,
    double? Longitude,
    string? SourceLanguage
);

public record CreateOfferRequest(
    Guid? SellerId,
    string? Title,
    string? Description,
    decimal PriceAmount,
    string PriceCurrency,
    decimal? OriginalPriceAmount,
    string OriginalPriceCurrency,
    DateTime StartDate,
    DateTime? EndDate,
    DateTime ExpirationDate,
    Antigaspi.Domain.Enums.OfferCategory? Category,
    string? PictureUrl,
    IFormFile? PictureFile,
    string? SourceLanguage,
    Guid? ProductId
);

public record ReasonRequest(string Reason);
