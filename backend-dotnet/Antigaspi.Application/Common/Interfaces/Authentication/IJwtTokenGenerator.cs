using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.Common.Interfaces.Authentication;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
