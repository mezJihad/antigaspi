using MediatR;
using Antigaspi.Application.Repositories;

namespace Antigaspi.Application.UseCases.Offers.Commands;

public record CancelOfferCommand(Guid OfferId, Guid UserId) : IRequest;

public class CancelOfferCommandHandler : IRequestHandler<CancelOfferCommand>
{
    private readonly IOfferRepository _offerRepository;

    public CancelOfferCommandHandler(IOfferRepository offerRepository)
    {
        _offerRepository = offerRepository;
    }

    public async Task Handle(CancelOfferCommand request, CancellationToken cancellationToken)
    {
        var offer = await _offerRepository.GetByIdAsync(request.OfferId, cancellationToken);
        if (offer == null)
            throw new KeyNotFoundException($"Offer with ID {request.OfferId} not found");

        // Ideally we should check if request.UserId is the seller of the offer
        // checking: if (offer.SellerId != request.SellerId) throw ...
        // For now, domain logic is simpler, but let's assume valid access or check repository

        offer.Cancel(request.UserId);

        await _offerRepository.UpdateAsync(offer, cancellationToken);
    }
}
