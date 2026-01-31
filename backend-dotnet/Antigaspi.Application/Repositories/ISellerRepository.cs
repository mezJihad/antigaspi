using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.Repositories;

public interface ISellerRepository
{
    Task<Seller?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Seller?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(Seller seller, CancellationToken cancellationToken = default);
    Task UpdateAsync(Seller seller, CancellationToken cancellationToken = default);
    Task DeleteAsync(Seller seller, CancellationToken cancellationToken = default);
    Task<IEnumerable<Seller>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetDistinctCitiesAsync(CancellationToken cancellationToken = default);
}
