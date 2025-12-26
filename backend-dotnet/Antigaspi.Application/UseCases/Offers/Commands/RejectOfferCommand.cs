using MediatR;
using Antigaspi.Application.Repositories;

namespace Antigaspi.Application.UseCases.Offers.Commands;

public record RejectOfferCommand(Guid OfferId, Guid AdminUserId, string Reason) : IRequest;

public class RejectOfferCommandHandler : IRequestHandler<RejectOfferCommand>
{
    private readonly IOfferRepository _offerRepository;

    public RejectOfferCommandHandler(IOfferRepository offerRepository)
    {
        _offerRepository = offerRepository;
    }

    public async Task Handle(RejectOfferCommand request, CancellationToken cancellationToken)
    {
        var offer = await _offerRepository.GetByIdAsync(request.OfferId, cancellationToken);
        if (offer == null)
            throw new KeyNotFoundException($"Offer with ID {request.OfferId} not found");

        offer.Reject(request.AdminUserId, request.Reason);

        await _offerRepository.UpdateAsync(offer, cancellationToken);
    }
}
