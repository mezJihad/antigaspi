using MediatR;
using Antigaspi.Application.Repositories;

namespace Antigaspi.Application.UseCases.Offers.Commands;

public record SubmitOfferForValidationCommand(Guid OfferId) : IRequest;

public class SubmitOfferForValidationCommandHandler : IRequestHandler<SubmitOfferForValidationCommand>
{
    private readonly IOfferRepository _offerRepository;

    public SubmitOfferForValidationCommandHandler(IOfferRepository offerRepository)
    {
        _offerRepository = offerRepository;
    }

    public async Task Handle(SubmitOfferForValidationCommand request, CancellationToken cancellationToken)
    {
        var offer = await _offerRepository.GetByIdAsync(request.OfferId, cancellationToken);
        if (offer == null)
            throw new KeyNotFoundException($"Offer with ID {request.OfferId} not found");

        offer.SubmitForValidation();

        await _offerRepository.UpdateAsync(offer, cancellationToken);
    }
}
