using Antigaspi.Application.Repositories;
using MediatR;

namespace Antigaspi.Application.UseCases.Auth.Commands;

public record VerifyEmailCommand(string Email, string Otp) : IRequest;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand>
{
    private readonly IUserRepository _userRepository;

    public VerifyEmailCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (!user.VerifyOtp(request.Otp))
        {
            throw new Exception("Invalid or expired OTP");
        }

        await _userRepository.UpdateAsync(user, cancellationToken);
    }
}
