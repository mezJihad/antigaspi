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

    public SellersController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> RegisterSeller([FromBody] RegisterSellerRequest request)
    {
        var updatedRequest = request with { UserId = Guid.Parse(User.Claims.First(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub).Value) };

        var command = new RegisterSellerCommand(
            updatedRequest.UserId,
            updatedRequest.StoreName,
            updatedRequest.Street,
            updatedRequest.City,
            updatedRequest.ZipCode,
            updatedRequest.Description
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
        var userId = Guid.Parse(User.Claims.First(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub).Value);
        var query = new GetSellerByUserIdQuery(userId);
        var seller = await _sender.Send(query);

        if (seller == null) return NotFound();

        return Ok(SellerResponse.FromEntity(seller));
    }
}
