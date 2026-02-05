using Antigaspi.Application.UseCases.Cities.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Antigaspi.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CitiesController : ControllerBase
{
    private readonly ISender _sender;

    public CitiesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<List<CityDto>>> GetAll([FromQuery] bool onlyActiveOffers = false, [FromQuery] string? country = null)
    {
        var result = await _sender.Send(new GetAllCitiesQuery(onlyActiveOffers, country));
        return Ok(result);
    }
}
