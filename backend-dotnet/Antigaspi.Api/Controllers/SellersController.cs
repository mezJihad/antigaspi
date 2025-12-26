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
    public async Task<IActionResult> RegisterSeller([FromBody] RegisterSellerRequest request)
    {
        var command = new RegisterSellerCommand(
            request.UserId,
            request.StoreName,
            request.Street,
            request.City,
            request.ZipCode,
            request.Description
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
}
