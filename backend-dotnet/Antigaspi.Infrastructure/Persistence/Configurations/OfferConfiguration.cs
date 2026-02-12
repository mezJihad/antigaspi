using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Antigaspi.Infrastructure.Persistence.Configurations;

public class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> builder)
    {
        builder.HasKey(x => x.Id);

        // Properties that remain on Offer
        builder.Property(x => x.SourceLanguage).IsRequired().HasMaxLength(10).HasDefaultValue("fr");
        builder.Property(x => x.Quantity).HasDefaultValue(1);

        builder.OwnsOne(x => x.Price, p =>
        {
            p.Property(pp => pp.Amount).HasColumnName("PriceAmount").HasColumnType("decimal(18,2)");
            p.Property(pp => pp.Currency).HasColumnName("PriceCurrency").HasMaxLength(3);
        });

        // Relationship with Product
        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent accidental deletions of history? Or Cascade if product deleted? Restrict is safer.

        // Relationship with Seller
        builder.HasOne(x => x.Seller)
            .WithMany()
            .HasForeignKey(x => x.SellerId)
            .OnDelete(DeleteBehavior.NoAction); // Modify to NoAction to avoid multiple cascade paths if Product also has Seller

        // Value Object Collection for StatusHistory
        builder.OwnsMany(x => x.StatusHistory, history =>
        {
            history.ToTable("OfferStatusHistory");
            history.WithOwner().HasForeignKey("OfferId");
            history.Property(x => x.Reason).HasMaxLength(500);
        });
    }
}
