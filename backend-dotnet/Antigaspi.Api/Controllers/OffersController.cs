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

    public OffersController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOffer([FromBody] CreateOfferRequest request)
    {
        var command = new CreateOfferCommand(
            request.SellerId,
            request.Title,
            request.Description,
            request.PriceAmount,
            request.PriceCurrency,
            request.OriginalPriceAmount,
            request.OriginalPriceCurrency,
            request.ExpirationDate,
            request.PictureUrl
        );

        var offerId = await _sender.Send(command);
        return CreatedAtAction(nameof(GetOfferById), new { id = offerId }, new { id = offerId });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOfferById(Guid id)
    {
        var query = new GetOfferByIdQuery(id);
        var offer = await _sender.Send(query);

        if (offer == null) return NotFound();

        return Ok(OfferResponse.FromEntity(offer));
    }

    [HttpPost("{id}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var command = new SubmitOfferForValidationCommand(id);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/validate")]
    public async Task<IActionResult> Validate(Guid id, [FromQuery] Guid adminUserId)
    {
        // Ideally adminUserId comes from auth token, simplifying for now
        var command = new ValidateOfferCommand(id, adminUserId);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromQuery] Guid adminUserId, [FromBody] ReasonRequest request)
    {
        var command = new RejectOfferCommand(id, adminUserId, request.Reason);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromQuery] Guid userId)
    {
        var command = new CancelOfferCommand(id, userId);
        await _sender.Send(command);
        return NoContent();
    }
}
