using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Antigaspi.Infrastructure.Persistence.Repositories;

public class SqlProductRepository : IProductRepository
{
    private readonly AntigaspiDbContext _context;

    public SqlProductRepository(AntigaspiDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _context.Products.AddAsync(product, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetBySellerIdAsync(Guid sellerId, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Where(x => x.SellerId == sellerId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Update(product);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
