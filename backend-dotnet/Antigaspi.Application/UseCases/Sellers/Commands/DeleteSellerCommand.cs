using MediatR;
using Antigaspi.Application.Repositories;

namespace Antigaspi.Application.UseCases.Sellers.Commands;

public record DeleteSellerCommand(Guid SellerId) : IRequest;

public class DeleteSellerCommandHandler : IRequestHandler<DeleteSellerCommand>
{
    private readonly ISellerRepository _sellerRepository;

    public DeleteSellerCommandHandler(ISellerRepository sellerRepository)
    {
        _sellerRepository = sellerRepository;
    }

    public async Task Handle(DeleteSellerCommand request, CancellationToken cancellationToken)
    {
        var seller = await _sellerRepository.GetByIdAsync(request.SellerId, cancellationToken);
        
        if (seller == null)
        {
            // Idempotent delete or throw? Usually throw if 404 expected, but 204 if already gone is also fine.
            // Let's throw to match typical API behavior where 404 is returned if resource doesn't exist.
            throw new KeyNotFoundException($"Seller with ID {request.SellerId} not found");
        }

        // EF Core Cascade Delete is configured, so we just need to delete the seller.
        await _sellerRepository.DeleteAsync(seller, cancellationToken);
    }
}
