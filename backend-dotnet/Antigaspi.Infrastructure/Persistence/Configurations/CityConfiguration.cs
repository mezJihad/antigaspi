using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Antigaspi.Infrastructure.Persistence.Configurations;

public class CityConfiguration : IEntityTypeConfiguration<City>
{
    public void Configure(EntityTypeBuilder<City> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.NameFr).IsRequired().HasMaxLength(100);
        builder.Property(c => c.NameAr).HasMaxLength(100);
        builder.Property(c => c.NameEn).HasMaxLength(100);

        builder.HasData(GetMoroccanCities());
    }

    private static IEnumerable<City> GetMoroccanCities()
    {
        int id = 1;
        return new List<City>
        {
            new City { Id = id++, NameFr = "Agadir", NameEn = "Agadir", NameAr = "أكادير" },
            new City { Id = id++, NameFr = "Al Hoceima", NameEn = "Al Hoceima", NameAr = "الحسيمة" },
            new City { Id = id++, NameFr = "Beni Mellal", NameEn = "Beni Mellal", NameAr = "بني ملال" },
            new City { Id = id++, NameFr = "Berrechid", NameEn = "Berrechid", NameAr = "برشيد" },
            new City { Id = id++, NameFr = "Casablanca", NameEn = "Casablanca", NameAr = "الدار البيضاء" },
            new City { Id = id++, NameFr = "Dakhla", NameEn = "Dakhla", NameAr = "الداخلة" },
            new City { Id = id++, NameFr = "El Jadida", NameEn = "El Jadida", NameAr = "الجديدة" },
            new City { Id = id++, NameFr = "Errachidia", NameEn = "Errachidia", NameAr = "الراشيدية" },
            new City { Id = id++, NameFr = "Essaouira", NameEn = "Essaouira", NameAr = "الصويرة" },
            new City { Id = id++, NameFr = "Fès", NameEn = "Fes", NameAr = "فاس" },
            new City { Id = id++, NameFr = "Guelmim", NameEn = "Guelmim", NameAr = "كلميم" },
            new City { Id = id++, NameFr = "Ifrane", NameEn = "Ifrane", NameAr = "إفران" },
            new City { Id = id++, NameFr = "Kénitra", NameEn = "Kenitra", NameAr = "القنيطرة" },
            new City { Id = id++, NameFr = "Khémisset", NameEn = "Khemisset", NameAr = "الخميسات" },
            new City { Id = id++, NameFr = "Khénifra", NameEn = "Khenifra", NameAr = "خنيفرة" },
            new City { Id = id++, NameFr = "Khouribga", NameEn = "Khouribga", NameAr = "خريبكة" },
            new City { Id = id++, NameFr = "Laâyoune", NameEn = "Laayoune", NameAr = "العيون" },
            new City { Id = id++, NameFr = "Larache", NameEn = "Larache", NameAr = "العرائش" },
            new City { Id = id++, NameFr = "Marrakech", NameEn = "Marrakech", NameAr = "مراكش" },
            new City { Id = id++, NameFr = "Meknès", NameEn = "Meknes", NameAr = "مكناس" },
            new City { Id = id++, NameFr = "Mohammedia", NameEn = "Mohammedia", NameAr = "المحمدية" },
            new City { Id = id++, NameFr = "Nador", NameEn = "Nador", NameAr = "الناظور" },
            new City { Id = id++, NameFr = "Ouarzazate", NameEn = "Ouarzazate", NameAr = "ورزازات" },
            new City { Id = id++, NameFr = "Oujda", NameEn = "Oujda", NameAr = "وجدة" },
            new City { Id = id++, NameFr = "Rabat", NameEn = "Rabat", NameAr = "الرباط" },
            new City { Id = id++, NameFr = "Safi", NameEn = "Safi", NameAr = "آسفي" },
            new City { Id = id++, NameFr = "Salé", NameEn = "Sale", NameAr = "سلا" },
            new City { Id = id++, NameFr = "Settat", NameEn = "Settat", NameAr = "سطات" },
            new City { Id = id++, NameFr = "Sidi Kacem", NameEn = "Sidi Kacem", NameAr = "سيدي قاسم" },
            new City { Id = id++, NameFr = "Sidi Slimane", NameEn = "Sidi Slimane", NameAr = "سيدي سليمان" },
            new City { Id = id++, NameFr = "Tanger", NameEn = "Tangier", NameAr = "طنجة" },
            new City { Id = id++, NameFr = "Tan-Tan", NameEn = "Tan-Tan", NameAr = "طانطان" },
            new City { Id = id++, NameFr = "Taounate", NameEn = "Taounate", NameAr = "تاونات" },
            new City { Id = id++, NameFr = "Taroudant", NameEn = "Taroudant", NameAr = "تارودانت" },
            new City { Id = id++, NameFr = "Taza", NameEn = "Taza", NameAr = "تازة" },
            new City { Id = id++, NameFr = "Témara", NameEn = "Temara", NameAr = "تمارة" },
            new City { Id = id++, NameFr = "Tétouan", NameEn = "Tetouan", NameAr = "تطوان" },
            new City { Id = id++, NameFr = "Tiznit", NameEn = "Tiznit", NameAr = "تيزنيت" }
        };
    }
}
