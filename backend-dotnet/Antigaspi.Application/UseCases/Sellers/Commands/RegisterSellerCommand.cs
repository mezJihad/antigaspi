using MediatR;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Antigaspi.Application.UseCases.Sellers.Commands;

public record RegisterSellerCommand(
    Guid UserId,
    string StoreName,
    string Street,
    string City,
    string? ZipCode,
    string Description,
    double? Latitude,
    double? Longitude,
    string SourceLanguage
) : IRequest<Guid>;

public class RegisterSellerCommandHandler : IRequestHandler<RegisterSellerCommand, Guid>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly Microsoft.Extensions.Logging.ILogger<RegisterSellerCommandHandler> _logger;

    public RegisterSellerCommandHandler(ISellerRepository sellerRepository, Microsoft.Extensions.Logging.ILogger<RegisterSellerCommandHandler> logger)
    {
        _sellerRepository = sellerRepository;
        _logger = logger;
    }

    public async Task<Guid> Handle(RegisterSellerCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling RegisterSellerCommand for User {UserId}", request.UserId);

        // 1. Check if user already has a seller account
        var existingSeller = await _sellerRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        if (existingSeller != null)
        {
            if (!existingSeller.IsApproved())
            {
                existingSeller.Approve();
                await _sellerRepository.UpdateAsync(existingSeller, cancellationToken);
            }
            return existingSeller.Id;
        }

        // 2. Create Address VO
        _logger.LogInformation("Creating Address VO for Street: {Street}, City: {City}", request.Street, request.City);
        var address = new Address(request.Street, request.City, request.ZipCode, "France", request.Latitude, request.Longitude);

        // 3. Create Seller Entity
        var seller = Seller.Create(
            request.UserId,
            request.StoreName,
            address,
            request.Description,
            request.SourceLanguage
        );

        // Auto-approve for MVP
        seller.Approve();

        // 4. Persist
        await _sellerRepository.AddAsync(seller, cancellationToken);

        return seller.Id;
    }
}
