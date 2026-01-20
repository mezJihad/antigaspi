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

    public RegisterUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if (await _userRepository.GetByEmailAsync(request.Email, cancellationToken) is not null)
        {
            throw new Exception("User with given email already exists");
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);
        
        // Parse role or default to CUSTOMER
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            role = UserRole.CUSTOMER;
        }

        var user = User.Create(request.FirstName, request.LastName, request.Email, passwordHash, role);

        await _userRepository.AddAsync(user, cancellationToken);
        
        return user.Id;
    }
}
