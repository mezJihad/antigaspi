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
            
            // 3. Send Email with Link
            var clientUrl = _configuration["ClientAppUrl"];
            var verificationLink = $"{clientUrl}/verify-email?email={System.Web.HttpUtility.UrlEncode(user.Email)}&token={System.Web.HttpUtility.UrlEncode(token)}";
            
            var subject = "NoGaspi - Vérifiez votre email";
            
            // Read template from file or use embedded string
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
      <p>Bienvenue sur NoGaspi ! Nous sommes ravis de vous compter parmi nous.</p>>
      <p>Pour finaliser votre inscription, veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email :</p>
      
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

        return user.Id;
    }
}
