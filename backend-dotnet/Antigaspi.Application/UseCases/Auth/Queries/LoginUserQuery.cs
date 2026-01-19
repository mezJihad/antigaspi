using Antigaspi.Application.Common.Interfaces.Authentication;
using Antigaspi.Application.Repositories;
using MediatR;

namespace Antigaspi.Application.UseCases.Auth.Queries;

public record LoginUserQuery(
    string Email,
    string Password
) : IRequest<AuthenticationResult>;

public record AuthenticationResult(
    Guid Id,
    string FirstName, 
    string LastName,
    string Email,
    string Token
);

public class LoginUserQueryHandler : IRequestHandler<LoginUserQuery, AuthenticationResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginUserQueryHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthenticationResult> Handle(LoginUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null)
        {
            throw new Exception("Invalid credentials");
        }

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
             throw new Exception("Invalid credentials");
        }

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthenticationResult(
            user.Id,
            "User", // First name placeholder
            "Name", // Last name placeholder
            user.Email,
            token
        );
    }
}
