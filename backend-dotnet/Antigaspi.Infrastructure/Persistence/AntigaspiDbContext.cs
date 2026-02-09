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
    public DbSet<City> Cities { get; set; }


    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}

public class UtcDateTimeConverter : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>
{
    public UtcDateTimeConverter()
        : base(v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
    {
    }
}
