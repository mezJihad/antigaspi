using Antigaspi.Domain.Enums;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Domain.Entities;

public class OfferStatusEntry
{
    public OfferStatus Status { get; }
    public Guid? ChangedBy { get; }
    public DateTime ChangedAt { get; }
    public string? Reason { get; }

    public OfferStatusEntry(OfferStatus status, Guid? changedBy, DateTime changedAt, string? reason)
    {
        Status = status;
        ChangedBy = changedBy;
        ChangedAt = changedAt;
        Reason = reason;
    }
}

public class Offer
{
    public Guid Id { get; private set; }
    public Guid SellerId { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public Money Price { get; private set; }
    public Money OriginalPrice { get; private set; }
    public string PictureUrl { get; private set; }
    public DateTime ExpirationDate { get; private set; }
    public OfferStatus Status { get; private set; }
    
    // Encapsulate collection
    private readonly List<OfferStatusEntry> _statusHistory = new();
    public IReadOnlyCollection<OfferStatusEntry> StatusHistory => _statusHistory.AsReadOnly();

    private Offer() { }

    public Offer(
        Guid sellerId,
        string title,
        string description,
        Money price,
        Money originalPrice,
        string pictureUrl,
        DateTime expirationDate,
        Guid? id = null,
        OfferStatus status = OfferStatus.DRAFT)
    {
        Id = id ?? Guid.NewGuid();
        SellerId = sellerId;
        Title = title;
        Description = description;
        Price = price;
        OriginalPrice = originalPrice;
        PictureUrl = pictureUrl;
        ExpirationDate = expirationDate;
        Status = status;
        
        ValidateState();
    }

    public static Offer Create(
        Guid sellerId,
        string title,
        string description,
        Money price,
        Money originalPrice,
        DateTime expirationDate,
        string pictureUrl)
    {
        if (sellerId == Guid.Empty) throw new ArgumentException("Offer requires a sellerId");

        // Invariant: Price must be lower than original price
        if (price != null && originalPrice != null && !price.IsLessThan(originalPrice))
        {
            throw new InvalidOperationException("Offer price must be lower than original price");
        }

        // Invariant: Expiration date must be in the future
        // Note: Using DateTime.UtcNow is safer for servers
        if (expirationDate <= DateTime.UtcNow)
        {
           // Allow close times or standard leniency? Strict check as per JS
           // JS: new Date(expirationDate) <= new Date()
           throw new InvalidOperationException("Expiration date must be in the future");
        }

        return new Offer(
            sellerId,
            title,
            description,
            price!,
            originalPrice!,
            pictureUrl,
            expirationDate,
            null,
            OfferStatus.DRAFT
        );
    }

    public void SubmitForValidation()
    {
        if (Status != OfferStatus.DRAFT && Status != OfferStatus.REJECTED)
        {
            throw new InvalidOperationException("Only draft or rejected offers can be submitted");
        }

        ValidateContent();
        TransitionTo(OfferStatus.PENDING_VALIDATION);
    }

    public void Validate(Guid adminUserId)
    {
        if (Status != OfferStatus.PENDING_VALIDATION)
        {
            throw new InvalidOperationException("Offer must be pending validation to be validated");
        }
        TransitionTo(OfferStatus.PUBLISHED, adminUserId);
    }

    public void Reject(Guid adminUserId, string reason)
    {
        if (Status != OfferStatus.PENDING_VALIDATION)
        {
            throw new InvalidOperationException("Offer must be pending validation to be rejected");
        }
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Rejection reason is required");

        TransitionTo(OfferStatus.REJECTED, adminUserId, reason);
    }

    public void Cancel(Guid userId)
    {
        if (Status != OfferStatus.PUBLISHED)
        {
            throw new InvalidOperationException("Only published offers can be canceled");
        }
        TransitionTo(OfferStatus.CANCELED, userId);
    }

    public void UpdateDetails(string? title, string? description, Money? price, Money? originalPrice)
    {
        if (Status == OfferStatus.PENDING_VALIDATION)
        {
            throw new InvalidOperationException("Cannot update offer while pending validation");
        }

        bool wasPublished = Status == OfferStatus.PUBLISHED;

        if (!string.IsNullOrWhiteSpace(title)) Title = title;
        if (!string.IsNullOrWhiteSpace(description)) Description = description;

        if (price != null && originalPrice != null)
        {
             if (!price.IsLessThan(originalPrice))
             {
                 throw new InvalidOperationException("Offer price must be lower than original price");
             }
             Price = price;
             OriginalPrice = originalPrice;
        }
        else if (price != null) {
            // Check against current original
            if (!price.IsLessThan(OriginalPrice)) throw new InvalidOperationException("Offer price must be lower than original price");
            Price = price;
        }
        else if (originalPrice != null) {
            // Check against current price
            if (!Price.IsLessThan(originalPrice)) throw new InvalidOperationException("Offer price must be lower than original price");
            OriginalPrice = originalPrice;
        }

        if (wasPublished)
        {
            TransitionTo(OfferStatus.DRAFT, null, "Reset to draft after modification");
        }
    }

    private void TransitionTo(OfferStatus newStatus, Guid? changedBy = null, string? reason = null)
    {
        Status = newStatus;
        _statusHistory.Add(new OfferStatusEntry(newStatus, changedBy, DateTime.UtcNow, reason));
    }

    private void ValidateState()
    {
        if (SellerId == Guid.Empty) throw new ArgumentException("SellerId is required");
    }

    private void ValidateContent()
    {
        if (string.IsNullOrWhiteSpace(Title) || 
            string.IsNullOrWhiteSpace(Description) || 
            Price == null || 
            OriginalPrice == null || 
            ExpirationDate == default)
        {
            throw new InvalidOperationException("Offer incomplete: missing required fields for submission");
        }
    }
}
