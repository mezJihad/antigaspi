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

        logger.LogInformation("Seeding database...");

        // Check for admin
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "mez.jihad@gmail.com");
        
        if (adminUser == null)
        {
            // Login: mez.jihad@gmail.com, Password: A@zerty123/
            string adminHash = BCrypt.Net.BCrypt.HashPassword("A@zerty123/");
            adminUser = User.Create("Admin", "System", "mez.jihad@gmail.com", adminHash, UserRole.ADMIN);
            adminUser.MarkEmailVerified(); // Auto-verify admin
            await context.Users.AddAsync(adminUser);
        }
        else 
        {
             // Ensure password is updated
             string adminHash = BCrypt.Net.BCrypt.HashPassword("A@zerty123/");
             adminUser.ChangePassword(adminHash);
             if (!adminUser.IsEmailVerified) adminUser.MarkEmailVerified();
             context.Users.Update(adminUser);
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Admin seeded / updated.");

        await SeedCitiesAsync(context, logger);
        await SeedSellersAsync(context, logger);
        await SeedOffersAsync(context, logger);

        await context.SaveChangesAsync();
        logger.LogInformation("Database seeded successfully.");
    }

    private static async Task SeedCitiesAsync(AntigaspiDbContext context, ILogger logger)
    {
        if (!await context.Cities.AnyAsync())
        {
            var cities = new List<City>
            {
                new City { NameFr = "Casablanca", NameAr = "الدار البيضاء", NameEn = "Casablanca" },
                new City { NameFr = "Rabat", NameAr = "الرباط", NameEn = "Rabat" },
                new City { NameFr = "Marrakech", NameAr = "مراكش", NameEn = "Marrakech" },
                new City { NameFr = "Tanger", NameAr = "طنجة", NameEn = "Tangier" },
                new City { NameFr = "Agadir", NameAr = "أكادير", NameEn = "Agadir" },
                new City { NameFr = "Fès", NameAr = "فاس", NameEn = "Fes" },
                new City { NameFr = "Meknès", NameAr = "مكناس", NameEn = "Meknes" },
                new City { NameFr = "Oujda", NameAr = "وجدة", NameEn = "Oujda" },
                new City { NameFr = "Kenitra", NameAr = "القنيطرة", NameEn = "Kenitra" },
                new City { NameFr = "Tetouan", NameAr = "تطوان", NameEn = "Tetouan" },
                new City { NameFr = "Safi", NameAr = "آسفي", NameEn = "Safi" },
                new City { NameFr = "Mohammedia", NameAr = "المحمدية", NameEn = "Mohammedia" },
                new City { NameFr = "Khouribga", NameAr = "خريبكة", NameEn = "Khouribga" },
                new City { NameFr = "Beni Mellal", NameAr = "بني ملال", NameEn = "Beni Mellal" },
                new City { NameFr = "El Jadida", NameAr = "الجديدة", NameEn = "El Jadida" },
                new City { NameFr = "Taza", NameAr = "تازة", NameEn = "Taza" },
                new City { NameFr = "Nador", NameAr = "الناظور", NameEn = "Nador" },
                new City { NameFr = "Settat", NameAr = "سطات", NameEn = "Settat" },
                new City { NameFr = "Larache", NameAr = "العرائش", NameEn = "Larache" },
                new City { NameFr = "Khemisset", NameAr = "الخميسات", NameEn = "Khemisset" },
                new City { NameFr = "Guelmim", NameAr = "كلميم", NameEn = "Guelmim" },
                new City { NameFr = "Berrechid", NameAr = "برشيد", NameEn = "Berrechid" },
                new City { NameFr = "Ouarzazate", NameAr = "ورزازات", NameEn = "Ouarzazate" },
                new City { NameFr = "Essaouira", NameAr = "الصويرة", NameEn = "Essaouira" },
                new City { NameFr = "Al Hoceima", NameAr = "الحسيمة", NameEn = "Al Hoceima" },
                new City { NameFr = "Tiznit", NameAr = "تيزنيت", NameEn = "Tiznit" },
                new City { NameFr = "Taroudant", NameAr = "تارودانت", NameEn = "Taroudant" },
                new City { NameFr = "Errachidia", NameAr = "الرشيدية", NameEn = "Errachidia" },
                new City { NameFr = "Dakhla", NameAr = "الداخلة", NameEn = "Dakhla" },
                new City { NameFr = "Laayoune", NameAr = "العيون", NameEn = "Laayoune" },
                new City { NameFr = "Chefchaouen", NameAr = "شفشاون", NameEn = "Chefchaouen" },
                new City { NameFr = "Ifrane", NameAr = "إفران", NameEn = "Ifrane" },
                new City { NameFr = "Azrou", NameAr = "أزرو", NameEn = "Azrou" },
                new City { NameFr = "Sefrou", NameAr = "صفرو", NameEn = "Sefrou" },
                new City { NameFr = "Tan-Tan", NameAr = "طانطان", NameEn = "Tan-Tan" },
                new City { NameFr = "Sidi Ifni", NameAr = "سيدي إفني", NameEn = "Sidi Ifni" },
                new City { NameFr = "Midelt", NameAr = "ميدلت", NameEn = "Midelt" },
                new City { NameFr = "Zagora", NameAr = "زاكورة", NameEn = "Zagora" },
                new City { NameFr = "Azemmour", NameAr = "أزمور", NameEn = "Azemmour" },
                new City { NameFr = "Skhirat", NameAr = "الصخيرات", NameEn = "Skhirat" },
                new City { NameFr = "Temara", NameAr = "تمارة", NameEn = "Temara" },
                new City { NameFr = "Sale", NameAr = "سلا", NameEn = "Sale" }
            };
            await context.Cities.AddRangeAsync(cities);
            await context.SaveChangesAsync();
            logger.LogInformation("Cities seeded.");
        }
    }

    private static async Task SeedSellersAsync(AntigaspiDbContext context, ILogger logger)
    {
        if (!await context.Sellers.AnyAsync())
        {
            // Create Seller User 1
            var sellerUser1 = await context.Users.FirstOrDefaultAsync(u => u.Email == "baker@antigaspi.ma");
            if (sellerUser1 == null)
            {
                string hash = BCrypt.Net.BCrypt.HashPassword("Seller123!");
                sellerUser1 = User.Create("Hassan", "Baker", "baker@antigaspi.ma", hash, UserRole.SELLER);
                sellerUser1.MarkEmailVerified();
                await context.Users.AddAsync(sellerUser1);
                await context.SaveChangesAsync(); // Save to get Id
            }

            var seller1Address = new Address("123 Bd Zerktouni", "Casablanca", "20000", "Maroc", 33.5731, -7.5898);
            var seller1 = Seller.Create(sellerUser1.Id, "La Boulangerie Hassan", seller1Address, "Best bakery in town");
            seller1.Approve();
            await context.Sellers.AddAsync(seller1);

            // Create Seller User 2
            var sellerUser2 = await context.Users.FirstOrDefaultAsync(u => u.Email == "grocer@antigaspi.ma");
            if (sellerUser2 == null)
            {
                string hash = BCrypt.Net.BCrypt.HashPassword("Seller123!");
                sellerUser2 = User.Create("Fatima", "Grocer", "grocer@antigaspi.ma", hash, UserRole.SELLER);
                sellerUser2.MarkEmailVerified();
                await context.Users.AddAsync(sellerUser2);
                await context.SaveChangesAsync();
            }

            var seller2Address = new Address("45 Av. Mohammed V", "Rabat", "10000", "Maroc", 34.0209, -6.8416);
            var seller2 = Seller.Create(sellerUser2.Id, "Epicerie Fatima", seller2Address, "Fresh produce daily");
            seller2.Approve();
            await context.Sellers.AddAsync(seller2);

            await context.SaveChangesAsync();
            logger.LogInformation("Sellers seeded.");
        }
    }

    private static async Task SeedOffersAsync(AntigaspiDbContext context, ILogger logger)
    {
        // Only seed if no offers (optional check, or check specifically for these offers if needed)
        if (!await context.Offers.AnyAsync())
        {
            var seller1 = await context.Sellers.FirstOrDefaultAsync(s => s.StoreName == "La Boulangerie Hassan");
            var seller2 = await context.Sellers.FirstOrDefaultAsync(s => s.StoreName == "Epicerie Fatima");

            if (seller1 != null)
            {
                // Offer 1
                var offer1 = Offer.Create(
                    seller1.Id,
                    "Panier Surprise Boulangerie",
                    "Un panier surprise contenant des viennoiseries et du pain de la veille.",
                    new Money(30, "MAD"),
                    new Money(60, "MAD"),
                    DateTime.UtcNow.AddHours(-2),
                    DateTime.UtcNow.AddHours(2), // End date
                    DateTime.UtcNow.AddHours(4), // Expiration
                    OfferCategory.Bakery,
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                );
                offer1.SubmitForValidation();
                // We need an admin ID to validate. Let's get the admin we created/checked earlier.
                var admin = await context.Users.FirstOrDefaultAsync(u => u.Email == "mez.jihad@gmail.com");
                if (admin != null) offer1.Validate(admin.Id);
                
                await context.Offers.AddAsync(offer1);

                // Offer 2
                 var offer2 = Offer.Create(
                    seller1.Id,
                    "Croissants Spéciaux",
                    "Assortiment de croissants aux amandes.",
                    new Money(20, "MAD"),
                    new Money(45, "MAD"),
                    DateTime.UtcNow.AddHours(-1),
                    DateTime.UtcNow.AddHours(5),
                    DateTime.UtcNow.AddHours(6),
                    OfferCategory.Bakery,
                    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"
                );
                offer2.SubmitForValidation();
                if (admin != null) offer2.Validate(admin.Id);
                await context.Offers.AddAsync(offer2);
            }

            if (seller2 != null)
            {
                // Offer 3
                var offer3 = Offer.Create(
                    seller2.Id,
                    "Panier Fruits et Légumes",
                    "Mélange de fruits et légumes de saison.",
                    new Money(50, "MAD"),
                    new Money(100, "MAD"),
                    DateTime.UtcNow.AddHours(-4),
                    DateTime.UtcNow.AddHours(4),
                    DateTime.UtcNow.AddHours(5),
                    OfferCategory.Produce,
                    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"
                );
                offer3.SubmitForValidation();
                var admin = await context.Users.FirstOrDefaultAsync(u => u.Email == "mez.jihad@gmail.com");
                if (admin != null) offer3.Validate(admin.Id);
                
                await context.Offers.AddAsync(offer3);
            }

            await context.SaveChangesAsync();
            logger.LogInformation("Offers seeded.");
        }
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
