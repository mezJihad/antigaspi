using Antigaspi.Domain.Entities; // Ensure Product is visible
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
    
    // Link to Product
    public Guid ProductId { get; private set; }
    public virtual Product Product { get; private set; } = null!;

    public Guid SellerId { get; private set; } // Denormalized for query perf or validation
    public virtual Seller Seller { get; private set; } = null!;
    
    // Offer specific details
    public Money Price { get; private set; } // The discounted price
    public DateTime StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public DateTime ExpirationDate { get; private set; }
    
    public OfferStatus Status { get; private set; }
    public OfferType Type { get; private set; }
    
    public int Quantity { get; private set; } // Stock for this offer
    
    public string SourceLanguage { get; private set; } = "fr"; 

    // Encapsulate collection
    private readonly List<OfferStatusEntry> _statusHistory = new();
    public IReadOnlyCollection<OfferStatusEntry> StatusHistory => _statusHistory.AsReadOnly();

    private Offer() { }

    public Offer(
        Guid sellerId,
        Guid productId,
        Money price,
        DateTime startDate,
        DateTime? endDate,
        DateTime expirationDate,
        OfferType type,
        int quantity = 1,
        Guid? id = null,
        OfferStatus status = OfferStatus.DRAFT,
        string sourceLanguage = "fr")
    {
        Id = id ?? Guid.NewGuid();
        SellerId = sellerId;
        ProductId = productId;
        Price = price;
        StartDate = startDate;
        EndDate = endDate;
        ExpirationDate = expirationDate;
        Type = type;
        Quantity = quantity;
        Status = status;
        SourceLanguage = sourceLanguage;
        
        ValidateState();
    }

    public static Offer Create(
        Guid sellerId,
        Guid productId,
        Money price,
        DateTime startDate,
        DateTime? endDate,
        DateTime expirationDate,
        OfferType type,
        int quantity = 1,
        string sourceLanguage = "fr")
    {
        if (sellerId == Guid.Empty) throw new ArgumentException("Offer requires a sellerId");
        if (productId == Guid.Empty) throw new ArgumentException("Offer requires a productId");

        // Invariant: Quantity must be positive
        if (quantity < 1) throw new InvalidOperationException("Quantity must be at least 1");

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
            productId,
            price!,
            startDate,
            endDate,
            expirationDate,
            type,
            quantity,
            null,
            OfferStatus.DRAFT,
            sourceLanguage
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
        Money? price, 
        DateTime? startDate,
        DateTime? endDate,
        DateTime? expirationDate, 
        OfferType? type,
        int? quantity,
        string? sourceLanguage = null)
    {
        if (Status == OfferStatus.PENDING_VALIDATION)
        {
            throw new InvalidOperationException("Cannot update offer while pending validation");
        }

        bool wasPublished = Status == OfferStatus.PUBLISHED;

        if (!string.IsNullOrWhiteSpace(sourceLanguage)) SourceLanguage = sourceLanguage;
        if (type.HasValue) Type = type.Value;
        if (quantity.HasValue) 
        {
            if (quantity.Value < 0) throw new InvalidOperationException("Quantity cannot be negative");
            Quantity = quantity.Value;
        }

        // Date Logic Checks
        var newStartDate = startDate ?? StartDate;
        var newEndDate = endDate ?? EndDate; 
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
        if (price != null) {
            // Note: OriginalPrice is now on Product. 
            // We can't strictly validate "IsLessThan(OriginalPrice)" here without loading Product.
            // Domain invariant might need to be relaxed or validated at Command handler level if Product is loaded.
            // For now, let's assume valid price.
            Price = price;
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
        if (ProductId == Guid.Empty) throw new ArgumentException("ProductId is required");
    }

    private void ValidateContent()
    {
        if (Price == null || 
            StartDate == default ||
            ExpirationDate == default)
        {
            throw new InvalidOperationException("Offer incomplete: missing required fields for submission");
        }
    }
}
