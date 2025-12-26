using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.UseCases.Sellers.Queries;

public record GetSellerByIdQuery(Guid Id) : IRequest<Seller?>;

public class GetSellerByIdQueryHandler : IRequestHandler<GetSellerByIdQuery, Seller?>
{
    private readonly ISellerRepository _sellerRepository;

    public GetSellerByIdQueryHandler(ISellerRepository sellerRepository)
    {
        _sellerRepository = sellerRepository;
    }

    public async Task<Seller?> Handle(GetSellerByIdQuery request, CancellationToken cancellationToken)
    {
        return await _sellerRepository.GetByIdAsync(request.Id, cancellationToken);
    }
}
