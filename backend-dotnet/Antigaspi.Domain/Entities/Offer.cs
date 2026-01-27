using Antigaspi.Domain.Enums;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Domain.Entities;

public class OfferStatusEntry
{
    public OfferStatus Status { get; private set; }
    public Guid? ChangedBy { get; private set; }
    public DateTime ChangedAt { get; private set; }
    public string? Reason { get; private set; }

    private OfferStatusEntry() { } // Required for EF Core

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
    public virtual Seller Seller { get; private set; } = null!;
    public string Title { get; private set; }
    public string Description { get; private set; }
    public Money Price { get; private set; }
    public Money OriginalPrice { get; private set; }
    public string PictureUrl { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public DateTime ExpirationDate { get; private set; }
    public OfferCategory Category { get; private set; }
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
        DateTime startDate,
        DateTime? endDate,
        DateTime expirationDate,
        OfferCategory category,
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
        StartDate = startDate;
        EndDate = endDate;
        ExpirationDate = expirationDate;
        Category = category;
        Status = status;
        
        ValidateState();
    }

    public static Offer Create(
        Guid sellerId,
        string title,
        string description,
        Money price,
        Money originalPrice,
        DateTime startDate,
        DateTime? endDate,
        DateTime expirationDate,
        OfferCategory category,
        string pictureUrl)
    {
        if (sellerId == Guid.Empty) throw new ArgumentException("Offer requires a sellerId");

        // Invariant: Price must be lower than original price
        if (price != null && originalPrice != null && !price.IsLessThan(originalPrice))
        {
            throw new InvalidOperationException("Offer price must be lower than original price");
        }

        // Invariant: EndDate must be after StartDate
        if (endDate.HasValue && endDate.Value <= startDate)
        {
           throw new InvalidOperationException("End date must be after start date");
        }

        // Invariant: ExpirationDate must be after or equal to EndDate (if set) or StartDate
        if (endDate.HasValue && expirationDate < endDate.Value)
        {
            throw new InvalidOperationException("Expiration date must be after or equal to end date");
        }
        if (expirationDate <= startDate)
        {
            throw new InvalidOperationException("Expiration date must be after start date");
        }

        return new Offer(
            sellerId,
            title,
            description,
            price!,
            originalPrice!,
            pictureUrl,
            startDate,
            endDate,
            expirationDate,
            category,
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
        if (Status == OfferStatus.CANCELED || Status == OfferStatus.EXPIRED)
        {
            throw new InvalidOperationException("Offer is already canceled or expired");
        }
        TransitionTo(OfferStatus.CANCELED, userId);
    }

    public void UpdateDetails(
        string? title, 
        string? description, 
        Money? price, 
        Money? originalPrice, 
        DateTime? startDate,
        DateTime? endDate,
        DateTime? expirationDate, 
        OfferCategory? category,
        string? pictureUrl)
    {
        if (Status == OfferStatus.PENDING_VALIDATION)
        {
            throw new InvalidOperationException("Cannot update offer while pending validation");
        }

        bool wasPublished = Status == OfferStatus.PUBLISHED;

        if (!string.IsNullOrWhiteSpace(title)) Title = title;
        if (!string.IsNullOrWhiteSpace(description)) Description = description;
        if (!string.IsNullOrWhiteSpace(pictureUrl)) PictureUrl = pictureUrl;

        // Date Logic Checks
        // We need to validate the new combination of dates.
        // If a date is null (not updated), we use the current value.
        var newStartDate = startDate ?? StartDate;
        var newEndDate = endDate ?? EndDate; // can remain null
        var newExpirationDate = expirationDate ?? ExpirationDate;

        if (newEndDate.HasValue && newEndDate.Value <= newStartDate)
        {
            throw new InvalidOperationException("End date must be after start date");
        }
        if (newEndDate.HasValue && newExpirationDate < newEndDate.Value)
        {
            throw new InvalidOperationException("Expiration date must be after or equal to end date");
        }
        if (newExpirationDate <= newStartDate)
        {
             throw new InvalidOperationException("Expiration date must be after start date");
        }

        // Apply Date Changes
        StartDate = newStartDate;
        EndDate = newEndDate;
        ExpirationDate = newExpirationDate;


        // Price Logic
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
            if (!price.IsLessThan(OriginalPrice)) throw new InvalidOperationException("Offer price must be lower than original price");
            Price = price;
        }
        else if (originalPrice != null) {
            if (!Price.IsLessThan(originalPrice)) throw new InvalidOperationException("Offer price must be lower than original price");
            OriginalPrice = originalPrice;
        }
        
        if (category.HasValue)
        {
            Category = category.Value;
        }

        // If it was published, we might want to keep it published IF only minor edits? 
        // For safety, let's keep the logic: modify = draft. 
        // OR if the user expects "live edit", we should allow it.
        // Let's decide: Text/Price updates reset to DRAFT for re-validation? 
        // For MVP speed, let's say updates are trusted for now (Antigaspi trust model), OR reset to draft.
        // The previous code reset to DRAFT. I will keep it for safety.
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
            StartDate == default ||
            ExpirationDate == default)
        {
            throw new InvalidOperationException("Offer incomplete: missing required fields for submission");
        }
    }
}
