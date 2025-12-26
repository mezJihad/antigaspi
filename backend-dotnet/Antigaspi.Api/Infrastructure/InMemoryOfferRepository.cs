using System.Collections.Concurrent;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;

namespace Antigaspi.Api.Infrastructure;

public class InMemoryOfferRepository : IOfferRepository
{
    private static readonly ConcurrentDictionary<Guid, Offer> _offers = new();

    public Task<Offer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _offers.TryGetValue(id, out var offer);
        return Task.FromResult(offer);
    }

    public Task AddAsync(Offer offer, CancellationToken cancellationToken = default)
    {
        _offers.TryAdd(offer.Id, offer);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Offer offer, CancellationToken cancellationToken = default)
    {
        _offers.AddOrUpdate(offer.Id, offer, (key, oldValue) => offer);
        return Task.CompletedTask;
    }
}
