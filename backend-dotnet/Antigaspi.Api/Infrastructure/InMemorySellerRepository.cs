using System.Collections.Concurrent;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;

namespace Antigaspi.Api.Infrastructure;

public class InMemorySellerRepository : ISellerRepository
{
    private static readonly ConcurrentDictionary<Guid, Seller> _sellers = new();

    public Task<Seller?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _sellers.TryGetValue(id, out var seller);
        return Task.FromResult(seller);
    }

    public Task<Seller?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var seller = _sellers.Values.FirstOrDefault(s => s.UserId == userId);
        return Task.FromResult(seller);
    }

    public Task AddAsync(Seller seller, CancellationToken cancellationToken = default)
    {
        _sellers.TryAdd(seller.Id, seller);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Seller seller, CancellationToken cancellationToken = default)
    {
        _sellers.AddOrUpdate(seller.Id, seller, (key, oldValue) => seller);
        return Task.CompletedTask;
    }
}
