using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Antigaspi.Infrastructure.Persistence;

public class AntigaspiDbContext : DbContext
{
    public AntigaspiDbContext(DbContextOptions<AntigaspiDbContext> options) : base(options)
    {
    }

    public DbSet<Offer> Offers { get; set; }
    public DbSet<Seller> Sellers { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
