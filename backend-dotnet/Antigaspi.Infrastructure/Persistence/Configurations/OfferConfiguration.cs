using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Antigaspi.Infrastructure.Persistence.Configurations;

public class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.PictureUrl).HasMaxLength(500);

        builder.OwnsOne(x => x.Price, p =>
        {
            p.Property(pp => pp.Amount).HasColumnName("PriceAmount").HasColumnType("decimal(18,2)");
            p.Property(pp => pp.Currency).HasColumnName("PriceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(x => x.OriginalPrice, p =>
        {
            p.Property(pp => pp.Amount).HasColumnName("OriginalPriceAmount").HasColumnType("decimal(18,2)");
            p.Property(pp => pp.Currency).HasColumnName("OriginalPriceCurrency").HasMaxLength(3);
        });

        // Relationship with Seller (Assuming unidirectional from Offer to Seller for now, as Offer has SellerId)
        // Relationship with Seller
        builder.HasOne(x => x.Seller)
            .WithMany()
            .HasForeignKey(x => x.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Value Object Collection for StatusHistory
        builder.OwnsMany(x => x.StatusHistory, history =>
        {
            history.ToTable("OfferStatusHistory");
            history.WithOwner().HasForeignKey("OfferId");
            history.Property(x => x.Reason).HasMaxLength(500);
        });
    }
}
