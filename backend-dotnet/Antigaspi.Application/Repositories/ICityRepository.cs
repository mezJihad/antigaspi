using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.Repositories;

public interface ICityRepository
{
    Task<List<City>> GetAllAsync(CancellationToken cancellationToken);
}
