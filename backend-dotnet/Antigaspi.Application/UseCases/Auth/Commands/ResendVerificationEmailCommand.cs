using Antigaspi.Application.Common.Interfaces.Authentication;
using Antigaspi.Application.Repositories;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace Antigaspi.Application.UseCases.Auth.Commands;

public record ResendVerificationEmailCommand(string Email) : IRequest;

public class ResendVerificationEmailCommandHandler : IRequestHandler<ResendVerificationEmailCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly Antigaspi.Application.Common.Interfaces.IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public ResendVerificationEmailCommandHandler(IUserRepository userRepository, Antigaspi.Application.Common.Interfaces.IEmailService emailService, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task Handle(ResendVerificationEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            // Security: Don't reveal if user exists
            return;
        }

        if (user.IsEmailVerified)
        {
            // Already verified, nothing to do
            return;
        }

        // Check rate limiting (3 attempts per 24 hours)
        if (!user.CanSendVerificationEmail(maxAttempts: 3, lockoutHours: 24))
        {
            // Security/UX: We should probably let the user know they are blocked to avoid confusion
            // Or typically we throw a specific exception that the controller maps to 429
            throw new Exception("TOO_MANY_ATTEMPTS");
        }

        // Generate NEW Token
        var token = Guid.NewGuid().ToString();
        user.SetOtp(token, 1440); // Valid for 24h
        
        // Update counts
        user.IncrementVerificationEmailCount(lockoutHours: 24);

        await _userRepository.UpdateAsync(user, cancellationToken);

        // Send Email (Using Brevo Template)
        var clientUrl = _configuration["ClientAppUrl"];
        var verificationLink = $"{clientUrl}/verify-email?email={System.Web.HttpUtility.UrlEncode(user.Email)}&token={System.Web.HttpUtility.UrlEncode(token)}";
        
        var templateId = _configuration.GetValue<long>("Brevo:Templates:VerificationEmail");
        
        var emailParams = new Dictionary<string, string>
        {
            { "verification_link", verificationLink },
            { "first_name", user.FirstName }
        };

        await _emailService.SendTemplateEmailAsync(user.Email, templateId, emailParams);
    }
}
