using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.Repositories;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
    Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetBySellerIdAsync(Guid sellerId, CancellationToken cancellationToken = default);
}
