using MediatR;
using Microsoft.AspNetCore.Mvc;
using Antigaspi.Application.UseCases.Auth.Commands;
using Antigaspi.Application.UseCases.Auth.Queries;
using Antigaspi.Api.Dtos;

namespace Antigaspi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var command = new RegisterUserCommand(request.FirstName, request.LastName, request.Email, request.Password, request.Role);
        var userId = await _sender.Send(command);

        return Ok(new { UserId = userId });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var query = new LoginUserQuery(request.Email, request.Password);
        var result = await _sender.Send(query);

        return Ok(new AuthResponse(result.Id, result.FirstName, result.LastName, result.Email, result.Token));
    }
}
