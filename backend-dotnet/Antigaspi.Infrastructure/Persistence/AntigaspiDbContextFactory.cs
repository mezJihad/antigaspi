using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Antigaspi.Infrastructure.Persistence;

public class AntigaspiDbContextFactory : IDesignTimeDbContextFactory<AntigaspiDbContext>
{
    public AntigaspiDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../Antigaspi.Api"))
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<AntigaspiDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        optionsBuilder.UseSqlServer(connectionString, b => b.MigrationsAssembly("Antigaspi.Infrastructure"));

        return new AntigaspiDbContext(optionsBuilder.Options);
    }
}
