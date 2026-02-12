using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Application.UseCases.Offers.Commands;

public record CreateOfferCommand(
    Guid SellerId,
    string? Title,
    string? Description,
    decimal PriceAmount,
    string PriceCurrency,
    decimal OriginalPriceAmount,
    string OriginalPriceCurrency,
    DateTime StartDate,
    DateTime? EndDate,
    DateTime ExpirationDate,
    Antigaspi.Domain.Enums.OfferCategory? Category,
    string? PictureUrl,
    string SourceLanguage,
    Guid? ProductId = null
) : IRequest<Guid>;

public class CreateOfferCommandHandler : IRequestHandler<CreateOfferCommand, Guid>
{
    private readonly IOfferRepository _offerRepository;
    private readonly ISellerRepository _sellerRepository;
    private readonly IProductRepository _productRepository;

    public CreateOfferCommandHandler(IOfferRepository offerRepository, ISellerRepository sellerRepository, IProductRepository productRepository)
    {
        _offerRepository = offerRepository;
        _sellerRepository = sellerRepository;
        _productRepository = productRepository;
    }

    public async Task<Guid> Handle(CreateOfferCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify Seller exists and is active/approved
        var seller = await _sellerRepository.GetByIdAsync(request.SellerId, cancellationToken);
        if (seller == null)
        {
            throw new InvalidOperationException("Seller not found");
        }
        if (!seller.IsApproved())
        {
            throw new InvalidOperationException("Seller is not approved to create offers");
        }

        // 2. Create Value Objects
        var price = Money.From(request.PriceAmount, request.PriceCurrency);
        var originalPrice = Money.From(request.OriginalPriceAmount, request.OriginalPriceCurrency);

        // 3. Get or Create Product
        Guid productId;
        
        if (request.ProductId.HasValue)
        {
            var existingProduct = await _productRepository.GetByIdAsync(request.ProductId.Value, cancellationToken);
            if (existingProduct == null)
                throw new KeyNotFoundException("Product not found");
            
            if (existingProduct.SellerId != request.SellerId)
                throw new InvalidOperationException("Product does not belong to this seller");

            productId = existingProduct.Id;
        }
        else
        {
            // Validate required fields for new Product
            if (string.IsNullOrWhiteSpace(request.Title)) throw new ArgumentException("Title is required when creating a new product.");
            if (string.IsNullOrWhiteSpace(request.Description)) throw new ArgumentException("Description is required when creating a new product.");
            if (!request.Category.HasValue) throw new ArgumentException("Category is required when creating a new product.");
            
            // Create Product Entity (Implicitly)
            var product = new Product(
                request.SellerId,
                request.Title!,
                request.Description!,
                request.Category.Value,
                originalPrice,
                request.PictureUrl ?? "" // PictureUrl might be empty?
            );
            await _productRepository.AddAsync(product, cancellationToken);
            productId = product.Id;
        }

        // 4. Create Offer Entity
        // Defaulting OfferType to AntiGaspi for now as per legacy flow
        var offer = Offer.Create(
            request.SellerId,
            productId,
            price,
            request.StartDate,
            request.EndDate,
            request.ExpirationDate,
            Antigaspi.Domain.Enums.OfferType.AntiGaspi,
            1, // Default Quantity
            request.SourceLanguage
        );

        // 5. Persist
        await _offerRepository.AddAsync(offer, cancellationToken);

        return offer.Id;
    }
}
