using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;

namespace Antigaspi.Application.UseCases.Products.Queries;

public record GetSellerProductsQuery(Guid SellerId) : IRequest<IEnumerable<Product>>;

public class GetSellerProductsQueryHandler : IRequestHandler<GetSellerProductsQuery, IEnumerable<Product>>
{
    private readonly IProductRepository _productRepository;

    public GetSellerProductsQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<Product>> Handle(GetSellerProductsQuery request, CancellationToken cancellationToken)
    {
        return await _productRepository.GetBySellerIdAsync(request.SellerId, cancellationToken);
    }
}
