using MediatR;
using Microsoft.AspNetCore.Mvc;
using Antigaspi.Application.UseCases.Sellers.Commands;
using Antigaspi.Application.UseCases.Sellers.Queries;
using Antigaspi.Api.Dtos;

namespace Antigaspi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SellersController : ControllerBase
{
    private readonly ISender _sender;
    private readonly Antigaspi.Application.Repositories.ISellerRepository _sellerRepo;

    public SellersController(ISender sender, Antigaspi.Application.Repositories.ISellerRepository sellerRepo)
    {
        _sender = sender;
        _sellerRepo = sellerRepo;
    }

    [HttpPost]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> RegisterSeller([FromBody] RegisterSellerRequest request)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
                          
        if (userIdClaim == null) return Unauthorized();

        var updatedRequest = request with { UserId = Guid.Parse(userIdClaim.Value) };

        var command = new RegisterSellerCommand(
            updatedRequest.UserId,
            updatedRequest.StoreName,
            updatedRequest.Street,
            updatedRequest.City,
            updatedRequest.ZipCode,
            updatedRequest.Description,
            updatedRequest.Latitude,
            updatedRequest.Longitude
        );

        var sellerId = await _sender.Send(command);
        return CreatedAtAction(nameof(GetSellerById), new { id = sellerId }, new { id = sellerId });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSellerById(Guid id)
    {
        var query = new GetSellerByIdQuery(id);
        var seller = await _sender.Send(query);

        if (seller == null) return NotFound();

        return Ok(SellerResponse.FromEntity(seller));
    }

    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
                          
        if (userIdClaim == null) return Unauthorized();

        var userId = Guid.Parse(userIdClaim.Value);
        var query = new GetSellerByUserIdQuery(userId);
        var seller = await _sender.Send(query);

        if (seller == null) return NotFound();

        // DEV FIX: Auto-approve seller if pending
        if (!seller.IsApproved())
        {
            seller.Approve();
            await _sellerRepo.UpdateAsync(seller);
        }

        return Ok(SellerResponse.FromEntity(seller));
    }

    [HttpGet("me/offers")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetMeOffers()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier) 
                          ?? User.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
                          
        if (userIdClaim == null) return Unauthorized();
        
        var userId = Guid.Parse(userIdClaim.Value);

        // 1. Get Seller ID from User ID
        var sellerQuery = new GetSellerByUserIdQuery(userId);
        var seller = await _sender.Send(sellerQuery);
        
        if (seller == null) return NotFound("Seller profile not found");

        // 2. Get Offers
        var query = new GetSellerOffersQuery(seller.Id);
        var offers = await _sender.Send(query);

        return Ok(offers.Select(OfferResponse.FromEntity));
    }
}
