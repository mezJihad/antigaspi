namespace Antigaspi.Api.Dtos;

public record RegisterRequest(
    string Email,
    string Password,
    string Role = "CUSTOMER"
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    Guid Id,
    string Email,
    string Token
);
