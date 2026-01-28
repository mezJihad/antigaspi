using Antigaspi.Domain.Enums;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Domain.Entities;

public class Seller
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string StoreName { get; private set; }
    public Address Address { get; private set; }
    public string Description { get; private set; }
    public SellerStatus Status { get; private set; }
    public string? RejectionReason { get; private set; }

    private Seller() { }

    public Seller(Guid userId, string storeName, Address address, string description, Guid? id = null, SellerStatus status = SellerStatus.PENDING, string? rejectionReason = null)
    {
        if (userId == Guid.Empty) throw new ArgumentException("Seller must be linked to a user");
        if (string.IsNullOrWhiteSpace(storeName)) throw new ArgumentException("Store name is required");
        if (address is null) throw new ArgumentNullException(nameof(address), "Address is required");

        Id = id ?? Guid.NewGuid();
        UserId = userId;
        StoreName = storeName;
        Address = address;
        Description = description;
        Status = status;
        RejectionReason = rejectionReason;
    }

    public static Seller Create(Guid userId, string storeName, Address address, string description)
    {
        return new Seller(userId, storeName, address, description);
    }

    public void UpdateDetails(string storeName, string description, Address address)
    {
        if (string.IsNullOrWhiteSpace(storeName)) throw new ArgumentException("Store name is required");
        if (address is null) throw new ArgumentNullException(nameof(address), "Address is required");

        StoreName = storeName;
        Description = description;
        Address = address;
    }

    public void Approve()
    {
        Status = SellerStatus.APPROVED;
        RejectionReason = null;
    }

    public void Reject(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Rejection reason is required");
        Status = SellerStatus.REJECTED;
        RejectionReason = reason;
    }

    public bool IsApproved()
    {
        return Status == SellerStatus.APPROVED;
    }
}
