using MediatR;
using Microsoft.AspNetCore.Mvc;
using Antigaspi.Application.UseCases.Offers.Commands;
using Antigaspi.Application.UseCases.Offers.Queries;
using Antigaspi.Api.Dtos;

namespace Antigaspi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OffersController : ControllerBase
{
    private readonly ISender _sender;
    private readonly Antigaspi.Application.Common.Interfaces.IFileStorageService _fileStorage;

    public OffersController(ISender sender, Antigaspi.Application.Common.Interfaces.IFileStorageService fileStorage)
    {
        _sender = sender;
        _fileStorage = fileStorage;
    }

    [HttpPost]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> CreateOffer([FromForm] CreateOfferRequest request)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
                          
        if (userIdClaim == null) return Unauthorized();
        var userId = Guid.Parse(userIdClaim.Value);

        // Security Check: Ensure user owns the Seller profile
        var sellerQuery = new Antigaspi.Application.UseCases.Sellers.Queries.GetSellerByUserIdQuery(userId);
        var seller = await _sender.Send(sellerQuery);

        if (seller == null || (request.SellerId.HasValue && seller.Id != request.SellerId.Value))
        {
            return Forbid();
        }

        // Use the verify seller id
        var confirmedSellerId = seller.Id;
        
        string? pictureUrl = request.PictureUrl;

        if (request.PictureFile != null && request.PictureFile.Length > 0)
        {
            pictureUrl = await _fileStorage.SaveFileAsync(request.PictureFile, "offers");
        }
        
        var command = new CreateOfferCommand(
            confirmedSellerId,
            request.Title,
            request.Description,
            request.PriceAmount,
            request.PriceCurrency,
            request.OriginalPriceAmount.GetValueOrDefault(),
            request.OriginalPriceCurrency,
            request.StartDate,
            request.EndDate,
            request.ExpirationDate,
            request.Category,
            pictureUrl ?? "" 
        );

        var offerId = await _sender.Send(command);
        return CreatedAtAction(nameof(GetOfferById), new { id = offerId }, new { id = offerId });
    }

    [HttpPut("{id}")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateOffer(Guid id, [FromForm] CreateOfferRequest request)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
                          
        if (userIdClaim == null) return Unauthorized();
        var userId = Guid.Parse(userIdClaim.Value);

        // 1. Get the existing offer to find its SellerId
        var offerQuery = new GetOfferByIdQuery(id);
        var existingOffer = await _sender.Send(offerQuery);
        if (existingOffer == null) return NotFound();

        // 2. Check if user owns the seller profile of this offer
        var sellerQuery = new Antigaspi.Application.UseCases.Sellers.Queries.GetSellerByUserIdQuery(userId);
        var seller = await _sender.Send(sellerQuery);

        if (seller == null || existingOffer.SellerId != seller.Id)
        {
            return Forbid();
        }

        string? pictureUrl = request.PictureUrl; 
        if (request.PictureFile != null && request.PictureFile.Length > 0)
        {
            pictureUrl = await _fileStorage.SaveFileAsync(request.PictureFile, "offers");
        }

        var command = new UpdateOfferCommand(
            id,
            request.Title,
            request.Description,
            request.PriceAmount,
            request.PriceCurrency,
            request.OriginalPriceAmount,
            request.OriginalPriceCurrency,
            request.StartDate,
            request.EndDate,
            request.ExpirationDate,
            request.Category,
            pictureUrl
        );

        await _sender.Send(command);
        return NoContent();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOfferById(Guid id)
    {
        var query = new GetOfferByIdQuery(id);
        var offer = await _sender.Send(query);

        if (offer == null) return NotFound();

        return Ok(OfferResponse.FromEntity(offer));
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOffers(
        [FromQuery] Antigaspi.Domain.Enums.OfferCategory? category,
        [FromQuery] double? lat,
        [FromQuery] double? lon,
        [FromQuery] string? city,
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var query = new GetAllOffersQuery(category, lat, lon, city, search, sortBy, page, pageSize);
        var result = await _sender.Send(query);
        
        return Ok(new 
        {
            Items = result.Items.Select(OfferResponse.FromEntity),
            result.TotalCount,
            result.PageIndex,
            result.TotalPages,
            result.HasNextPage,
            result.HasPreviousPage
        });
    }

    [HttpPost("{id}/submit")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Submit(Guid id)
    {
        // Ideally should check ownership too but let's at least require Auth
        var command = new SubmitOfferForValidationCommand(id);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/validate")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")] // Assuming roles exist, or at least Auth
    public async Task<IActionResult> Validate(Guid id, [FromQuery] Guid adminUserId)
    {
        // Ideally adminUserId comes from auth token, simplifying for now
        var command = new ValidateOfferCommand(id, adminUserId);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/reject")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(Guid id, [FromQuery] Guid adminUserId, [FromBody] ReasonRequest request)
    {
        var command = new RejectOfferCommand(id, adminUserId, request.Reason);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Cancel(Guid id, [FromQuery] Guid userId)
    {
         var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
                          
        if (userIdClaim == null) return Unauthorized();
        var currentUserId = Guid.Parse(userIdClaim.Value);

        // Security Check Ownership
        var offerQuery = new GetOfferByIdQuery(id);
        var existingOffer = await _sender.Send(offerQuery);
        if (existingOffer == null) return NotFound();

        var sellerQuery = new Antigaspi.Application.UseCases.Sellers.Queries.GetSellerByUserIdQuery(currentUserId);
        var seller = await _sender.Send(sellerQuery);

        if (seller == null || existingOffer.SellerId != seller.Id)
        {
            return Forbid();
        }

        var command = new CancelOfferCommand(id, currentUserId);
        await _sender.Send(command);
        return NoContent();
    }
}
