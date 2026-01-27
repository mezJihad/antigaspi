using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Antigaspi.Infrastructure.Persistence.Repositories;

public class SqlOfferRepository : IOfferRepository
{
    private readonly AntigaspiDbContext _context;

    public SqlOfferRepository(AntigaspiDbContext context)
    {
        _context = context;
    }

    public async Task<Offer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Offers
            .Include(o => o.StatusHistory) // Eagerly load owned collection
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task AddAsync(Offer offer, CancellationToken cancellationToken = default)
    {
        await _context.Offers.AddAsync(offer, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Offer offer, CancellationToken cancellationToken = default)
    {
        _context.Offers.Update(offer);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Offer>> GetAllAsync(CancellationToken cancellationToken = default)
    {
         return await _context.Offers
            .Include(o => o.StatusHistory)
            .Include(o => o.Seller)
                .ThenInclude(s => s.Address)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Offer>> GetBySellerIdAsync(Guid sellerId, CancellationToken cancellationToken = default)
    {
        return await _context.Offers
           .Where(o => o.SellerId == sellerId && o.Status != Domain.Enums.OfferStatus.CANCELED)
           .Include(o => o.StatusHistory)
           .Include(o => o.Seller) // Optional if we already know the seller
           .ToListAsync(cancellationToken);
    }
}
