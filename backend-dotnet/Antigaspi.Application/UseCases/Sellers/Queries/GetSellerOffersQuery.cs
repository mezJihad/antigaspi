using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using MediatR;

namespace Antigaspi.Application.UseCases.Sellers.Queries;

public record GetSellerOffersQuery(Guid SellerId) : IRequest<IEnumerable<Offer>>;

public class GetSellerOffersQueryHandler : IRequestHandler<GetSellerOffersQuery, IEnumerable<Offer>>
{
    private readonly IOfferRepository _repository;

    public GetSellerOffersQueryHandler(IOfferRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Offer>> Handle(GetSellerOffersQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetBySellerIdAsync(request.SellerId, cancellationToken);
    }
}
