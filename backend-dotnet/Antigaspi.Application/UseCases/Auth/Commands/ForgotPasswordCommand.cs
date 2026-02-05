using Antigaspi.Application.Common.Interfaces;
using Antigaspi.Application.Repositories;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace Antigaspi.Application.UseCases.Auth.Commands;

public record ForgotPasswordCommand(string Email) : IRequest;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public ForgotPasswordCommandHandler(IUserRepository userRepository, IEmailService emailService, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            // Security: Don't reveal if user exists. 
            // We pretend it worked to prevent email enumeration.
            return;
        }

        // Generate Token
        var token = Guid.NewGuid().ToString();
        user.SetOtp(token, 15); // Valid for 15 minutes for security

        await _userRepository.UpdateAsync(user, cancellationToken);

        // Send Email
        var clientUrl = _configuration["ClientAppUrl"];
        // Link points to frontend ResetPassword page
        // Pass language prop to link if needed by frontend
        var resetLink = $"{clientUrl}/reset-password?email={System.Web.HttpUtility.UrlEncode(user.Email)}&token={System.Web.HttpUtility.UrlEncode(token)}&lang={user.PreferredLanguage}";
        
        string templateConfigKey = $"Brevo:Templates:ResetPasswordEmail_{user.PreferredLanguage.ToUpper()}";
        var templateId = _configuration.GetValue<long>(templateConfigKey);
        
        if (templateId == 0)
        {
            templateId = _configuration.GetValue<long>("Brevo:Templates:ResetPasswordEmail");
        }
        
        var emailParams = new Dictionary<string, string>
        {
            { "reset_link", resetLink },
            { "first_name", user.FirstName }
        };

        if (templateId > 0)
        {
            await _emailService.SendTemplateEmailAsync(user.Email, templateId, emailParams);
        }
    }
}
