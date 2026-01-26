using Antigaspi.Domain.Entities;
using Antigaspi.Domain.Enums;
using Antigaspi.Domain.ValueObjects;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace Antigaspi.Infrastructure.Persistence;

public class AntigaspiSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AntigaspiDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AntigaspiSeeder>>();

        // Global check removed to allow incremental seeding
        // We will check for individual existing data below.


        logger.LogInformation("Seeding database...");

        // 1. Create Users
        // 1. Create Users
        var sellerUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "seller@antigaspi.test");
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@antigaspi.test");

        if (sellerUser == null)
        {
            sellerUser = User.Create("Jean", "Dupont", "seller@antigaspi.test", "hash123", UserRole.SELLER);
            await context.Users.AddAsync(sellerUser);
        }

        if (adminUser == null)
        {
            adminUser = User.Create("Admin", "System", "admin@antigaspi.test", "hash123", UserRole.ADMIN);
            await context.Users.AddAsync(adminUser);
        }

        await context.SaveChangesAsync(); // Ensure IDs are generated/saved
        
        // 2. Create Seller
        var seller = await context.Sellers.FirstOrDefaultAsync(s => s.UserId == sellerUser.Id);
        if (seller == null)
        {
            var address = new Address("123 rue de Paris", "Paris", "75001", "France");
            seller = Seller.Create(sellerUser.Id, "Boulangerie Bio", address, "Meilleure boulangerie du quartier");
            seller.Approve();
            await context.Sellers.AddAsync(seller);
            await context.SaveChangesAsync();
        }

        // 3. Create Casablanca Sellers
        var bimUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "bim@casablanca.test");
        if (bimUser == null)
        {
            bimUser = User.Create("Bim", "Manager", "bim@casablanca.test", "hash123", UserRole.SELLER);
            await context.Users.AddAsync(bimUser);
        }

        var carrefourUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "carrefour@casablanca.test");
        if (carrefourUser == null)
        {
            carrefourUser = User.Create("Carrefour", "Manager", "carrefour@casablanca.test", "hash123", UserRole.SELLER);
            await context.Users.AddAsync(carrefourUser);
        }
        
        await context.SaveChangesAsync();

        // 4. Sellers
        var bimSeller = await context.Sellers.FirstOrDefaultAsync(s => s.UserId == bimUser.Id);
        if (bimSeller == null) 
        {
             var addressBim = new Address("Boulevard 2 Mars", "Casablanca", "20250", "Maroc", 33.5731, -7.6091);
             bimSeller = Seller.Create(bimUser.Id, "BIM 2 Mars", addressBim, "Offres exclusives BIM");
             bimSeller.Approve();
             await context.Sellers.AddAsync(bimSeller);
        }

        var carrefourSeller = await context.Sellers.FirstOrDefaultAsync(s => s.UserId == carrefourUser.Id);
        if (carrefourSeller == null)
        {
            var addressCarrefour = new Address("Boulevard Anoual", "Casablanca", "20250", "Maroc", 33.5688, -7.6112);
            carrefourSeller = Seller.Create(carrefourUser.Id, "Carrefour Market Anoual", addressCarrefour, "Votre supermarché de proximité");
            carrefourSeller.Approve();
            await context.Sellers.AddAsync(carrefourSeller);
        }
        
        await context.SaveChangesAsync();
        
        // 5. Offers (Check count to avoid adding duplicates every run, simplistic check)
        var bimOffersCount = await context.Offers.CountAsync(o => o.SellerId == bimSeller.Id);
        if (bimOffersCount == 0)
        {

        // 4. Create Offers for Casablanca
        // BIM Offers
        var offerBim1 = Offer.Create(
            bimSeller.Id,
            "Pack Yaourt & Fromage",
            "Lot de 12 yaourts et 2 fromages frais à consommer rapidement.",
            Money.From(15.00m, "MAD"),
            Money.From(30.00m, "MAD"),
            DateTime.UtcNow,
            null,
            DateTime.UtcNow.AddDays(3),
            OfferCategory.Dairy,
            "https://placehold.co/600x400/blue/white?text=Yaourts+BIM"
        );
        offerBim1.SubmitForValidation();
        offerBim1.Validate(adminUser.Id);

        var offerBim2 = Offer.Create(
            bimSeller.Id,
            "Biscuits et Chocolats",
            "Assortiment de biscuits avec boite abîmée.",
            Money.From(20.00m, "MAD"),
            Money.From(45.00m, "MAD"),
            DateTime.UtcNow,
            null,
            DateTime.UtcNow.AddDays(10),
            OfferCategory.Grocery,
            "https://placehold.co/600x400/purple/white?text=Biscuits+BIM"
        );
        offerBim2.SubmitForValidation();
        offerBim2.Validate(adminUser.Id);

        // Carrefour Offers
        var offerCarrefour1 = Offer.Create(
            carrefourSeller.Id,
            "Poulet Rôti",
            "Poulet rôti du jour, invendu de la rôtisserie.",
            Money.From(25.00m, "MAD"),
            Money.From(50.00m, "MAD"),
            DateTime.UtcNow,
            null,
            DateTime.UtcNow.AddDays(1),
            OfferCategory.MeatFish,
            "https://placehold.co/600x400/red/white?text=Poulet+Carrefour"
        );
        offerCarrefour1.SubmitForValidation();
        offerCarrefour1.Validate(adminUser.Id);

        var offerCarrefour2 = Offer.Create(
            carrefourSeller.Id,
            "Panier Fruits de saison",
            "Panier de 3kg de fruits variés (pommes, bananes, oranges) légèrement mûrs.",
            Money.From(30.00m, "MAD"),
            Money.From(60.00m, "MAD"),
            DateTime.UtcNow,
            null,
            DateTime.UtcNow.AddDays(2),
            OfferCategory.Produce,
            "https://placehold.co/600x400/green/white?text=Fruits+Carrefour"
        );
        offerCarrefour2.SubmitForValidation();
        offerCarrefour2.Validate(adminUser.Id);
        
        // Add existing demo offers too (preserving original logic or just appending)
        // I'll append the new ones to the list.
        
        // Create original demo data
        // ... (preserving original offers 1 and 2 logic if needed, but I'm rewriting the block)
        // Let's keep the original "Paris" offers as well for variety.
         
        // 3. Create Original Demo Offers (Paris)
        var offer1 = Offer.Create(
           seller.Id,
           "Panier Surprise Boulangerie (Paris)",
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
            "Lot de Baguettes (Paris)",
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

        await context.Offers.AddRangeAsync(offer1, offer2, offerBim1, offerBim2, offerCarrefour1, offerCarrefour2);
        }

        
        // 6. Extensive Seeding for Other Cities (Agadir, Tanger, Rabat, Marrakech)
        // Check if we already have data for these cities to avoid duplication
        var rabatUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "seller.rabat@antigaspi.test");
        if (rabatUser == null)
        {
            var cities = new[]
            {
                new { Name = "Rabat", Zip = "10000", Lat = 34.0209, Lon = -6.8416 },
                new { Name = "Tanger", Zip = "90000", Lat = 35.7595, Lon = -5.8340 },
                new { Name = "Marrakech", Zip = "40000", Lat = 31.6295, Lon = -7.9811 },
                new { Name = "Agadir", Zip = "80000", Lat = 30.4278, Lon = -9.5981 }
            };

            var categories = Enum.GetValues<OfferCategory>();
            var random = new Random();

            foreach (var city in cities)
            {
                // Create 2 sellers per city
                for (int s = 1; s <= 2; s++)
                {
                    var email = $"seller.{city.Name.ToLower()}{s}@antigaspi.test";
                    var user = User.Create($"Seller{s}", city.Name, email, "hash123", UserRole.SELLER);
                    await context.Users.AddAsync(user);
                    
                    // Address with slight random offset for realism (approx 500m-1km)
                    var latOffset = (random.NextDouble() - 0.5) * 0.02; 
                    var lonOffset = (random.NextDouble() - 0.5) * 0.02;
                    
                    var address = new Address($"Quartier {city.Name} {s}", city.Name, city.Zip, "Maroc", city.Lat + latOffset, city.Lon + lonOffset);
                    var newSeller = Seller.Create(user.Id, $"Supermarché {city.Name} {s}", address, $"Le meilleur de l'anti-gaspi à {city.Name}");
                    newSeller.Approve();
                    await context.Sellers.AddAsync(newSeller);

                    // Create 6-7 offers per seller (Total 4 cities * 2 sellers * ~6 offers = ~48 offers)
                    int offerCount = random.Next(6, 8); 
                    for (int i = 0; i < offerCount; i++)
                    {
                        var cat = categories[random.Next(categories.Length)];
                        var price = random.Next(15, 80);
                        var originalPrice = price * (1.2 + random.NextDouble()); // 20-100% markup

                        var offer = Offer.Create(
                            newSeller.Id,
                            $"Panier {cat} Surprise #{i+1}",
                            $"Un délicieux panier surprise contenant des produits de la catégorie {cat}. Sauvez la planète !",
                            Money.From((decimal)price, "MAD"),
                            Money.From((decimal)originalPrice, "MAD"),
                            DateTime.UtcNow,
                            null,
                            DateTime.UtcNow.AddDays(random.Next(1, 5)),
                            cat,
                             $"https://placehold.co/600x400/{GetColorForCategory(cat)}/white?text={cat}+{city.Name}"
                        );
                        offer.SubmitForValidation();
                        offer.Validate(adminUser.Id);
                        await context.Offers.AddAsync(offer);
                    }
                }
            }
        }
        
        await context.SaveChangesAsync();
        logger.LogInformation("Database seeded successfully.");
    }
    
    private static string GetColorForCategory(OfferCategory category)
    {
        return category switch
        {
            OfferCategory.Bakery => "orange",
            OfferCategory.Produce => "green",
            OfferCategory.MeatFish => "red",
            OfferCategory.Dairy => "blue",
            OfferCategory.Prepared => "brown",
            OfferCategory.Grocery => "purple",
            _ => "gray"
        };
    }
}
