using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Application.UseCases.Sellers.Commands;

public record RegisterSellerCommand(
    Guid UserId,
    string StoreName,
    string Street,
    string City,
    string ZipCode,
    string Description
) : IRequest<Guid>;

public class RegisterSellerCommandHandler : IRequestHandler<RegisterSellerCommand, Guid>
{
    private readonly ISellerRepository _sellerRepository;

    public RegisterSellerCommandHandler(ISellerRepository sellerRepository)
    {
        _sellerRepository = sellerRepository;
    }

    public async Task<Guid> Handle(RegisterSellerCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if user already has a seller account? (Optional logic)
        // For now, assume User service handles auth/identity, here we just link.

        // 2. Create Address VO
        var address = new Address(request.Street, request.City, request.ZipCode);

        // 3. Create Seller Entity
        var seller = Seller.Create(
            request.UserId,
            request.StoreName,
            address,
            request.Description
        );

        // 4. Persist
        await _sellerRepository.AddAsync(seller, cancellationToken);

        return seller.Id;
    }
}
