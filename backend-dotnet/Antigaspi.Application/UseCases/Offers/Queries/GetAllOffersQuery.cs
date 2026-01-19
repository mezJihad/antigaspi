using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using MediatR;

namespace Antigaspi.Application.UseCases.Offers.Queries;

public record GetAllOffersQuery() : IRequest<IEnumerable<Offer>>;

public class GetAllOffersQueryHandler : IRequestHandler<GetAllOffersQuery, IEnumerable<Offer>>
{
    private readonly IOfferRepository _repository;

    public GetAllOffersQueryHandler(IOfferRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Offer>> Handle(GetAllOffersQuery request, CancellationToken cancellationToken)
    {
        // We will need to add GetAllAsync to the repository interface first
        // For now, let's assume it exists or we will add it
        return await _repository.GetAllAsync(cancellationToken);
    }
}
