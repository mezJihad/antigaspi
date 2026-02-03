using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Antigaspi.Infrastructure.Persistence.Repositories;

public class SqlCityRepository : ICityRepository
{
    private readonly AntigaspiDbContext _context;

    public SqlCityRepository(AntigaspiDbContext context)
    {
        _context = context;
    }

    public async Task<List<City>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Cities
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.NameFr)
            .ToListAsync(cancellationToken);
    }
}
