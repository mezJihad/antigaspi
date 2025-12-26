using MediatR;
using Antigaspi.Application.Repositories;

namespace Antigaspi.Application.UseCases.Offers.Commands;

public record ValidateOfferCommand(Guid OfferId, Guid AdminUserId) : IRequest;

public class ValidateOfferCommandHandler : IRequestHandler<ValidateOfferCommand>
{
    private readonly IOfferRepository _offerRepository;

    public ValidateOfferCommandHandler(IOfferRepository offerRepository)
    {
        _offerRepository = offerRepository;
    }

    public async Task Handle(ValidateOfferCommand request, CancellationToken cancellationToken)
    {
        var offer = await _offerRepository.GetByIdAsync(request.OfferId, cancellationToken);
        if (offer == null)
            throw new KeyNotFoundException($"Offer with ID {request.OfferId} not found");

        offer.Validate(request.AdminUserId);

        await _offerRepository.UpdateAsync(offer, cancellationToken);
    }
}
