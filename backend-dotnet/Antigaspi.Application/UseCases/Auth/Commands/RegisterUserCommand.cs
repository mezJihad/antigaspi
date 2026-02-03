using Antigaspi.Application.Common.Interfaces.Authentication;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Configuration;

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
    private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

    public RegisterUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, Antigaspi.Application.Common.Interfaces.IEmailService emailService, Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if (await _userRepository.GetByEmailAsync(request.Email, cancellationToken) is not null)
        {
            throw new Exception("User with given email already exists");
        }

        // 1. Password Complexity Check
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
        // Regex allows ANY character (.{8,}) but enforces the complexity requirements via lookaheads
        var passwordRegex = new System.Text.RegularExpressions.Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$");
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
        // Generate GUID Token
        var token = Guid.NewGuid().ToString();
        user.SetOtp(token, 1440); // We reuse the OtpCode field for the token, valid for 24h

        await _userRepository.AddAsync(user, cancellationToken);
            
            // 3. Send Email with Link (Using Brevo Template)
            var clientUrl = _configuration["ClientAppUrl"];
            var verificationLink = $"{clientUrl}/verify-email?email={System.Web.HttpUtility.UrlEncode(user.Email)}&token={System.Web.HttpUtility.UrlEncode(token)}";
            
            var templateId = _configuration.GetValue<long>("Brevo:Templates:VerificationEmail");
            
            // If template ID is not configured (e.g. 0), fallback to old behavior or log warning
            // treating it as required for now since user provided it.
            
            var emailParams = new Dictionary<string, string>
            {
                { "verification_link", verificationLink },
                { "first_name", user.FirstName }
            };

            await _emailService.SendTemplateEmailAsync(user.Email, templateId, emailParams);

        return user.Id;
    }
}
