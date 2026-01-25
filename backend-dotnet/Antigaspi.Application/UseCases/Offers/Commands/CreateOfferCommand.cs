using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Application.UseCases.Offers.Commands;

public record CreateOfferCommand(
    Guid SellerId,
    string Title,
    string Description,
    decimal PriceAmount,
    string PriceCurrency,
    decimal OriginalPriceAmount,
    string OriginalPriceCurrency,
    DateTime StartDate,
    DateTime? EndDate,
    DateTime ExpirationDate,
    Antigaspi.Domain.Enums.OfferCategory Category,
    string PictureUrl
) : IRequest<Guid>;

public class CreateOfferCommandHandler : IRequestHandler<CreateOfferCommand, Guid>
{
    private readonly IOfferRepository _offerRepository;
    private readonly ISellerRepository _sellerRepository;

    public CreateOfferCommandHandler(IOfferRepository offerRepository, ISellerRepository sellerRepository)
    {
        _offerRepository = offerRepository;
        _sellerRepository = sellerRepository;
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

        // 3. Create Offer Entity
        var offer = Offer.Create(
            request.SellerId,
            request.Title,
            request.Description,
            price,
            originalPrice,
            request.StartDate,
            request.EndDate,
            request.ExpirationDate,
            request.Category,
            request.PictureUrl
        );

        // 4. Persist
        await _offerRepository.AddAsync(offer, cancellationToken);

        return offer.Id;
    }
}
