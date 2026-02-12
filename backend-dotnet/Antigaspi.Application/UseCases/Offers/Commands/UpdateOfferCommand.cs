using MediatR;
using Antigaspi.Domain.Enums;
using Antigaspi.Application.Repositories;

namespace Antigaspi.Application.UseCases.Offers.Commands;

public record UpdateOfferCommand(
    Guid OfferId,
    string? Title,
    string? Description,
    decimal PriceAmount,
    string PriceCurrency,
    decimal? OriginalPriceAmount,
    string? OriginalPriceCurrency,
    DateTime StartDate,
    DateTime? EndDate,
    DateTime ExpirationDate,
    OfferCategory? Category,
    string? PictureUrl,
    string? SourceLanguage
) : IRequest;

public class UpdateOfferCommandHandler : IRequestHandler<UpdateOfferCommand>
{
    private readonly IOfferRepository _offerRepository;
    private readonly IProductRepository _productRepository;

    public UpdateOfferCommandHandler(IOfferRepository offerRepository, IProductRepository productRepository)
    {
        _offerRepository = offerRepository;
        _productRepository = productRepository;
    }

    public async Task Handle(UpdateOfferCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch existing offer
        var offer = await _offerRepository.GetByIdAsync(request.OfferId, cancellationToken);
        if (offer == null)
        {
            throw new KeyNotFoundException($"Offer with ID {request.OfferId} not found");
        }

        // 2. Update Product Properties (Backward Compatibility / Legacy Mode: Update the single product linked to this offer)
        // Note: In the future, if multiple offers link to same product, this would affect all of them.
        // For now, 1-to-1 mapping via implicit creation means this is safe.
        if (offer.Product != null)
        {
            offer.Product.Update(
                request.Title ?? offer.Product.Title,
                request.Description ?? offer.Product.Description,
                request.Category ?? offer.Product.Category,
                request.OriginalPriceAmount.HasValue ? new Antigaspi.Domain.ValueObjects.Money(request.OriginalPriceAmount.Value, "MAD") : null,
                request.PictureUrl ?? offer.Product.PictureUrl,
                null
            );
            
            await _productRepository.UpdateAsync(offer.Product, cancellationToken);
        }

        // 3. Update Offer Properties
        offer.UpdateDetails(
            new Antigaspi.Domain.ValueObjects.Money(request.PriceAmount, request.PriceCurrency),
            request.StartDate,
            request.EndDate,
            request.ExpirationDate,
            null, // OfferType not yet exposed in UpdateCommand, default or keep existing. If we want to support it, we need to add it to Command.
            null, // Quantity default or keep
            request.SourceLanguage
        );

        // 4. Save Changes to Offer
        await _offerRepository.UpdateAsync(offer, cancellationToken);
    }
}
