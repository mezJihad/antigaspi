using Antigaspi.Application.Common.Interfaces.Authentication;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.Enums;
using MediatR;

namespace Antigaspi.Application.UseCases.Auth.Commands;

public record RegisterUserCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Role = "BUYER" // Default role, can be "SELLER" if we allow direct seller reg
) : IRequest<Guid>;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly Antigaspi.Application.Common.Interfaces.IEmailService _emailService;

    public RegisterUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, Antigaspi.Application.Common.Interfaces.IEmailService emailService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
    }

    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if (await _userRepository.GetByEmailAsync(request.Email, cancellationToken) is not null)
        {
            throw new Exception("User with given email already exists");
        }

        // 1. Password Complexity Check
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
        var passwordRegex = new System.Text.RegularExpressions.Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
        if (!passwordRegex.IsMatch(request.Password))
        {
            throw new Exception("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);
        
        // Parse role or default to CUSTOMER
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            role = UserRole.CUSTOMER;
        }

        var user = User.Create(request.FirstName, request.LastName, request.Email, passwordHash, role);

        // 2. Generate and Set OTP
        var otp = new Random().Next(100000, 999999).ToString();
        user.SetOtp(otp);

        await _userRepository.AddAsync(user, cancellationToken);
        
        // 3. Send Email
        var subject = "AntiGaspi - Vérifiez votre email";
        var body = $"<h1>Bienvenue sur AntiGaspi !</h1><p>Votre code de vérification est : <strong>{otp}</strong></p><p>Ce code est valable pour 15 minutes.</p>";
        
        // Fire and forget email to not block response? Or await? Better await for reliability in this flow.
        await _emailService.SendEmailAsync(user.Email, subject, body);

        return user.Id;
    }
}
