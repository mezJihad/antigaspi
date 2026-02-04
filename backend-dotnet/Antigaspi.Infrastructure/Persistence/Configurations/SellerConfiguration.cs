using Antigaspi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Antigaspi.Infrastructure.Persistence.Configurations;

public class SellerConfiguration : IEntityTypeConfiguration<Seller>
{
    public void Configure(EntityTypeBuilder<Seller> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.StoreName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.RejectionReason).HasMaxLength(500);
        builder.Property(x => x.SourceLanguage).IsRequired().HasMaxLength(10).HasDefaultValue("fr");

        builder.OwnsOne(x => x.Address, a =>
        {
            a.Property(aa => aa.Street).HasColumnName("Street").HasMaxLength(200);
            a.Property(aa => aa.City).HasColumnName("City").HasMaxLength(100);
            a.Property(aa => aa.ZipCode).HasColumnName("ZipCode").HasMaxLength(20);
            a.Property(aa => aa.Country).HasColumnName("Country").HasMaxLength(100);
            a.Property(aa => aa.Latitude).HasColumnName("Latitude");
            a.Property(aa => aa.Longitude).HasColumnName("Longitude");
        });

        builder.HasOne<User>()
            .WithOne()
            .HasForeignKey<Seller>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
