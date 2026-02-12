using Antigaspi.Domain.Enums;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Domain.Entities;

public class Product
{
    public Guid Id { get; private set; }
    public Guid SellerId { get; private set; }
    // Navigation property if needed, but keeping it decoupled for now or matching Offer
    // public virtual Seller Seller { get; private set; } 

    public string Title { get; private set; }
    public string Description { get; private set; }
    public OfferCategory Category { get; private set; }
    public Money OriginalPrice { get; private set; }
    public string PictureUrl { get; private set; }
    public string? GTIN { get; private set; } // EAN/UPC

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private Product() { }

    public Product(
        Guid sellerId,
        string title,
        string description,
        OfferCategory category,
        Money originalPrice,
        string pictureUrl,
        string? gtin = null)
    {
        Id = Guid.NewGuid();
        SellerId = sellerId;
        Title = title;
        Description = description;
        Category = category;
        OriginalPrice = originalPrice;
        PictureUrl = pictureUrl;
        GTIN = gtin;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(
        string? title,
        string? description,
        OfferCategory? category,
        Money? originalPrice,
        string? pictureUrl,
        string? gtin)
    {
        if (!string.IsNullOrWhiteSpace(title)) Title = title;
        if (!string.IsNullOrWhiteSpace(description)) Description = description;
        if (category.HasValue) Category = category.Value;
        if (originalPrice != null) OriginalPrice = originalPrice;
        if (!string.IsNullOrWhiteSpace(pictureUrl)) PictureUrl = pictureUrl;
        if (gtin != null) GTIN = gtin; // Allow clearing? if needed

        UpdatedAt = DateTime.UtcNow;
    }
}
