using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.UseCases.Offers.Queries;

public record GetOfferByIdQuery(Guid Id) : IRequest<Offer?>;

public class GetOfferByIdQueryHandler : IRequestHandler<GetOfferByIdQuery, Offer?>
{
    private readonly IOfferRepository _offerRepository;

    public GetOfferByIdQueryHandler(IOfferRepository offerRepository)
    {
        _offerRepository = offerRepository;
    }

    public async Task<Offer?> Handle(GetOfferByIdQuery request, CancellationToken cancellationToken)
    {
        return await _offerRepository.GetByIdAsync(request.Id, cancellationToken);
    }
}
