using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using MediatR;

namespace Antigaspi.Application.UseCases.Offers.Queries;

public record GetAllOffersQuery(Antigaspi.Domain.Enums.OfferCategory? Category = null) : IRequest<IEnumerable<Offer>>;

public class GetAllOffersQueryHandler : IRequestHandler<GetAllOffersQuery, IEnumerable<Offer>>
{
    private readonly IOfferRepository _repository;

    public GetAllOffersQueryHandler(IOfferRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Offer>> Handle(GetAllOffersQuery request, CancellationToken cancellationToken)
    {
        // Simple client-side filtering (server-side evaluation still) for MVP
        // Ideally: _repository.GetActiveOffersAsync(cancellationToken);
        
        var offers = await _repository.GetAllAsync(cancellationToken);
        var now = DateTime.UtcNow;

        return offers.Where(o => 
            // 0. Filter by Category if provided
            (!request.Category.HasValue || o.Category == request.Category.Value) &&
            // 1. Is within validity period
            o.StartDate <= now && 
            (!o.EndDate.HasValue || o.EndDate.Value > now) &&
            // 2. Is Published (if using status workflow, currently we might see all for dev, but let's filter)
            (o.Status == Domain.Enums.OfferStatus.PUBLISHED || true) // Keeping all statuses for now as we don't have publishing workflow fully active in UI yet
        );
    }
}
