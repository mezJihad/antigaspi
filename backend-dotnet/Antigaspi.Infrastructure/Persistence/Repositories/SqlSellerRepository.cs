using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Antigaspi.Infrastructure.Persistence.Repositories;

public class SqlSellerRepository : ISellerRepository
{
    private readonly AntigaspiDbContext _context;

    public SqlSellerRepository(AntigaspiDbContext context)
    {
        _context = context;
    }

    public async Task<Seller?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Sellers
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<Seller?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Sellers
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(Seller seller, CancellationToken cancellationToken = default)
    {
        await _context.Sellers.AddAsync(seller, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Seller seller, CancellationToken cancellationToken = default)
    {
        _context.Sellers.Update(seller);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Seller seller, CancellationToken cancellationToken = default)
    {
        _context.Sellers.Remove(seller);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<string>> GetDistinctCitiesAsync(CancellationToken cancellationToken = default)
    {
        // Only return cities where there are offers!
        return await _context.Offers
            .Include(o => o.Seller)
            .Select(o => o.Seller.Address.City)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);
    }
}
