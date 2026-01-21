namespace Antigaspi.Api.Dtos;

using Microsoft.AspNetCore.Http;

public record RegisterSellerRequest(
    Guid UserId,
    string StoreName,
    string Street,
    string City,
    string ZipCode,
    string Description
);

public record CreateOfferRequest(
    Guid SellerId,
    string Title,
    string Description,
    decimal PriceAmount,
    string PriceCurrency,
    decimal OriginalPriceAmount,
    string OriginalPriceCurrency,
    DateTime StartDate,
    DateTime? EndDate,
    string? PictureUrl,
    IFormFile? PictureFile
);

public record ReasonRequest(string Reason);
