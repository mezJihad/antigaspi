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
    public async Task<ActionResult<List<CityDto>>> GetAll()
    {
        var result = await _sender.Send(new GetAllCitiesQuery());
        return Ok(result);
    }
}
