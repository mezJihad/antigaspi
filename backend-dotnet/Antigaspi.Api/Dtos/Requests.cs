namespace Antigaspi.Api.Dtos;

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
    DateTime ExpirationDate,
    string PictureUrl
);

public record ReasonRequest(string Reason);
