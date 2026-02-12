using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Antigaspi.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.PictureUrl).HasMaxLength(500);
        builder.Property(x => x.GTIN).HasMaxLength(20);

        builder.OwnsOne(x => x.OriginalPrice, p =>
        {
            p.Property(pp => pp.Amount).HasColumnName("OriginalPriceAmount").HasColumnType("decimal(18,2)");
            p.Property(pp => pp.Currency).HasColumnName("OriginalPriceCurrency").HasMaxLength(3);
        });

        // Index on SellerId for performance queries
        builder.HasIndex(x => x.SellerId);
    }
}
