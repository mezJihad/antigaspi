namespace Antigaspi.Api.Dtos;

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Role = "CUSTOMER"
);

public record LoginRequest(
    string Email,
    string Password
);

public record VerifyEmailRequest(
    string Email,
    string Otp
);

public record AuthResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Token
);
