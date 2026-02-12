using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Application.UseCases.Products.Commands;

public record CreateProductCommand(
    Guid SellerId,
    string Title,
    string Description,
    Antigaspi.Domain.Enums.OfferCategory Category,
    decimal OriginalPriceAmount,
    string OriginalPriceCurrency,
    string PictureUrl,
    string? GTIN
) : IRequest<Guid>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IProductRepository _productRepository;

    public CreateProductCommandHandler(ISellerRepository sellerRepository, IProductRepository productRepository)
    {
        _sellerRepository = sellerRepository;
        _productRepository = productRepository;
    }

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify Seller
        var seller = await _sellerRepository.GetByIdAsync(request.SellerId, cancellationToken);
        if (seller == null)
        {
            throw new KeyNotFoundException("Seller not found");
        }
        
        // 2. Create Product
        var originalPrice = Money.From(request.OriginalPriceAmount, request.OriginalPriceCurrency);
        var product = new Product(
            request.SellerId,
            request.Title,
            request.Description,
            request.Category,
            originalPrice,
            request.PictureUrl
        );

        // 3. Persist
        await _productRepository.AddAsync(product, cancellationToken);

        return product.Id;
    }
}
