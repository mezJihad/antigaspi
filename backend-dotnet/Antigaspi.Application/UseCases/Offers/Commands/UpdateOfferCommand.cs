using MediatR;
using Antigaspi.Domain.Enums;
using Antigaspi.Application.Repositories;

namespace Antigaspi.Application.UseCases.Offers.Commands;

public record UpdateOfferCommand(
    Guid OfferId,
    string Title,
    string Description,
    decimal PriceAmount,
    string PriceCurrency,
    decimal? OriginalPriceAmount,
    string? OriginalPriceCurrency,
    DateTime StartDate,
    DateTime? EndDate,
    DateTime ExpirationDate,
    OfferCategory Category,
    string? PictureUrl,
    string? SourceLanguage
) : IRequest;

public class UpdateOfferCommandHandler : IRequestHandler<UpdateOfferCommand>
{
    private readonly IOfferRepository _offerRepository;

    public UpdateOfferCommandHandler(IOfferRepository offerRepository)
    {
        _offerRepository = offerRepository;
    }

    public async Task Handle(UpdateOfferCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch existing offer
        var offer = await _offerRepository.GetByIdAsync(request.OfferId, cancellationToken);
        if (offer == null)
        {
            throw new KeyNotFoundException($"Offer with ID {request.OfferId} not found");
        }

        // 2. Update Properties
        // Assuming the entity has methods or public setters. 
        // We will directly update the entity state here for simplicity, 
        // though typically we'd use a domain method like offer.Update(...)
        
        // Reflection or manual mapping
        offer.UpdateDetails(
            request.Title,
            request.Description,
            new Antigaspi.Domain.ValueObjects.Money(request.PriceAmount, request.PriceCurrency),
            request.OriginalPriceAmount.HasValue ? new Antigaspi.Domain.ValueObjects.Money(request.OriginalPriceAmount.Value, request.OriginalPriceCurrency ?? "MAD") : null,
            request.StartDate,
            request.EndDate,
            request.ExpirationDate,
            request.Category,
            request.PictureUrl,
            request.SourceLanguage
        );

        // 3. Save Changes
        await _offerRepository.UpdateAsync(offer, cancellationToken);
    }
}
