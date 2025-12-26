using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.Repositories;

public interface IOfferRepository
{
    Task<Offer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Offer offer, CancellationToken cancellationToken = default);
    Task UpdateAsync(Offer offer, CancellationToken cancellationToken = default);
    // Add other query methods as needed, e.g. GetBySellerIdAsync
}
