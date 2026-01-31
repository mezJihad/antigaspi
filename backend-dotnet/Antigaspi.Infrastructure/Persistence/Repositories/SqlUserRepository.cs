using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Antigaspi.Infrastructure.Persistence.Repositories;

public class SqlUserRepository : IUserRepository
{
    private readonly AntigaspiDbContext _context;

    public SqlUserRepository(AntigaspiDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
    }
    public async Task<IEnumerable<Antigaspi.Application.Dtos.AdminUserSummaryDto>> GetUsersWithDetailsAsync(CancellationToken cancellationToken = default)
    {
        var query = from u in _context.Users
                    join s in _context.Sellers on u.Id equals s.UserId into userSellers
                    from seller in userSellers.DefaultIfEmpty()
                    select new
                    {
                        User = u,
                        Seller = seller,
                        OfferCount = seller != null ? _context.Offers.Count(o => o.SellerId == seller.Id) : 0
                    };

        var result = await query.ToListAsync(cancellationToken);

        return result.Select(x => new Antigaspi.Application.Dtos.AdminUserSummaryDto(
            x.User.Id,
            x.User.FirstName,
            x.User.LastName,
            x.User.Email,
            x.User.Role.ToString(),
            x.User.IsActive,
            x.Seller?.Id,
            x.Seller?.StoreName,
            x.Seller?.Address.City,
            x.Seller?.Status,
            x.OfferCount
        ));
    }
}
