using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.UseCases.Sellers.Queries;

public record GetSellerByUserIdQuery(Guid UserId) : IRequest<Seller?>;

public class GetSellerByUserIdQueryHandler : IRequestHandler<GetSellerByUserIdQuery, Seller?>
{
    private readonly ISellerRepository _sellerRepository;

    public GetSellerByUserIdQueryHandler(ISellerRepository sellerRepository)
    {
        _sellerRepository = sellerRepository;
    }

    public async Task<Seller?> Handle(GetSellerByUserIdQuery request, CancellationToken cancellationToken)
    {
        return await _sellerRepository.GetByUserIdAsync(request.UserId, cancellationToken);
    }
}
