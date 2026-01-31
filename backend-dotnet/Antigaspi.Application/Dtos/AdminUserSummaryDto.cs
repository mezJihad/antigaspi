using Antigaspi.Domain.Enums;

namespace Antigaspi.Application.Dtos;

public record AdminUserSummaryDto(
    Guid UserId,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    bool IsActive,
    Guid? SellerId,
    string? StoreName,
    string? City,
    SellerStatus? SellerStatus,
    int OfferCount
);
