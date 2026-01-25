using Antigaspi.Domain.Entities;
using Antigaspi.Domain.Enums;
using Antigaspi.Domain.ValueObjects;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Antigaspi.Infrastructure.Persistence;

public class AntigaspiSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AntigaspiDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AntigaspiSeeder>>();

        if (context.Offers.Any())
        {
            logger.LogInformation("Database already seeded.");
            return;
        }

        logger.LogInformation("Seeding database...");

        // 1. Create Users
        // 1. Create Users
        var sellerUser = User.Create("Jean", "Dupont", "seller@antigaspi.test", "hash123", UserRole.SELLER);
        var adminUser = User.Create("Admin", "System", "admin@antigaspi.test", "hash123", UserRole.ADMIN);
        
        await context.Users.AddRangeAsync(sellerUser, adminUser);
        
        // 2. Create Seller
        var address = new Address("123 rue de Paris", "Paris", "75001", "France");
        var seller = Seller.Create(sellerUser.Id, "Boulangerie Bio", address, "Meilleure boulangerie du quartier");
        seller.Approve();
        
        await context.Sellers.AddAsync(seller);

        // 3. Create Offers
        var offer1 = Offer.Create(
            seller.Id,
            "Panier Surprise Boulangerie",
            "Un panier contenant des viennoiseries et du pain de la veille.",
            Money.From(3.99m, "EUR"),
            Money.From(12.00m, "EUR"),
            DateTime.UtcNow,
            null,
            DateTime.UtcNow.AddDays(2),
            OfferCategory.Bakery,
            "https://placehold.co/600x400/orange/white?text=Panier+Boulangerie"
        );
        offer1.SubmitForValidation();
        offer1.Validate(adminUser.Id);

        var offer2 = Offer.Create(
            seller.Id,
            "Lot de Baguettes",
            "5 baguettes tradition invendues.",
            Money.From(2.50m, "EUR"),
            Money.From(5.00m, "EUR"),
            DateTime.UtcNow,
            null,
            DateTime.UtcNow.AddDays(1),
            OfferCategory.Bakery,
            "https://placehold.co/600x400/brown/white?text=Baguettes"
        );
         offer2.SubmitForValidation();
        offer2.Validate(adminUser.Id);

        await context.Offers.AddRangeAsync(offer1, offer2);

        await context.SaveChangesAsync();
        logger.LogInformation("Database seeded successfully.");
    }
}
