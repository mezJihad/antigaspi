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

        // Send Email
        var clientUrl = _configuration["ClientAppUrl"];
        var verificationLink = $"{clientUrl}/verify-email?email={System.Web.HttpUtility.UrlEncode(user.Email)}&token={System.Web.HttpUtility.UrlEncode(token)}";
        
        var subject = "NoGaspi - Nouveau lien de vérification";
        
        // Reuse template but slightly modified subject/body if needed (here same body is fine)
        var body = $@"<!DOCTYPE html>
<html>
<head>
<meta charset=""UTF-8"">
<style>
  body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0; margin: 0; }}
  .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
  .header {{ text-align: center; margin-bottom: 30px; }}
  .logo {{ font-size: 28px; font-weight: bold; color: #2ecc71; text-decoration: none; }}
  .content {{ color: #555555; line-height: 1.6; font-size: 16px; }}
  .btn-container {{ text-align: center; margin: 30px 0; }}
  .btn {{ display: inline-block; padding: 15px 30px; background-color: #2ecc71; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(46, 204, 113, 0.2); }}
  .footer {{ font-size: 12px; color: #999999; text-align: center; margin-top: 40px; border-top: 1px solid #eeeeee; padding-top: 20px; }}
  .link-fallback {{ font-size: 12px; color: #999999; word-break: break-all; margin-top: 20px; }}
</style>
</head>
<body>
  <div class=""container"">
    <div class=""header"">
      <div class=""logo"">NoGaspi</div>
    </div>
    <div class=""content"">
      <p>Bonjour,</p>
      <p>Vous avez demandé un nouveau lien de vérification pour votre compte NoGaspi.</p>
      <p>Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email :</p>
      
      <div class=""btn-container"">
        <a href=""{verificationLink}"" class=""btn"">Vérifier mon email</a>
      </div>
      
      <p>Ce lien est valable pendant <strong>24 heures</strong>.</p>
      
      <div class=""link-fallback"">
        <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
        <a href=""{verificationLink}"" style=""color: #2ecc71;"">{verificationLink}</a></p>
      </div>

      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
    </div>
    
    <div class=""footer"">
      &copy; 2026 NoGaspi. Tous droits réservés.<br>
      Ceci est un email automatique, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>";

        await _emailService.SendEmailAsync(user.Email, subject, body);
    }
}
