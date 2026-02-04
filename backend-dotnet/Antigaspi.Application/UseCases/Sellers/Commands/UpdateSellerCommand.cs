using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Application.UseCases.Sellers.Commands;

public record UpdateSellerCommand(
    Guid SellerId,
    string StoreName,
    string Street,
    string City,
    string? ZipCode,
    string Description,
    double? Latitude,
    double? Longitude,
    string? SourceLanguage
) : IRequest;

public class UpdateSellerCommandHandler : IRequestHandler<UpdateSellerCommand>
{
    private readonly ISellerRepository _sellerRepository;

    public UpdateSellerCommandHandler(ISellerRepository sellerRepository)
    {
        _sellerRepository = sellerRepository;
    }

    public async Task Handle(UpdateSellerCommand request, CancellationToken cancellationToken)
    {
        var seller = await _sellerRepository.GetByIdAsync(request.SellerId, cancellationToken);
        
        if (seller == null)
        {
            throw new KeyNotFoundException($"Seller with ID {request.SellerId} not found");
        }

        var address = new Address(request.Street, request.City, request.ZipCode, "France", request.Latitude, request.Longitude);

        seller.UpdateDetails(request.StoreName, request.Description, address, request.SourceLanguage);

        await _sellerRepository.UpdateAsync(seller, cancellationToken);
    }
}
