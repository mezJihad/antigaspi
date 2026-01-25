using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.Repositories;

public interface IOfferRepository
{
    Task<Offer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Offer offer, CancellationToken cancellationToken = default);
    Task UpdateAsync(Offer offer, CancellationToken cancellationToken = default);
    Task<IEnumerable<Offer>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Offer>> GetBySellerIdAsync(Guid sellerId, CancellationToken cancellationToken = default);
}
