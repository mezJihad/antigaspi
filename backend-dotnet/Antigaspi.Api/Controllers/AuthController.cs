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
        try
        {
            Console.WriteLine($"[AuthController] Register Request: Email={request.Email}, Language={request.Language}");
            var command = new RegisterUserCommand(request.FirstName, request.LastName, request.Email, request.Password, request.Role, request.Language);
            var userId = await _sender.Send(command);

            return Ok(new { UserId = userId });
        }
        catch (Exception ex) when (ex.Message == "User with given email already exists")
        {
            return Conflict(new { message = "EMAIL_EXISTS" });
        }
        catch (Exception ex) when (ex.Message.StartsWith("Password must be"))
        {
             return BadRequest(new { message = "WEAK_PASSWORD" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var query = new LoginUserQuery(request.Email, request.Password);
            var result = await _sender.Send(query);
            return Ok(new AuthResponse(result.Id, result.FirstName, result.LastName, result.Email, result.Role, result.Token));
        }
        catch (Exception ex) when (ex.Message == "ACCOUNT_SUSPENDED")
        {
            return StatusCode(403, new { message = "ACCOUNT_SUSPENDED" });
        }
        catch (Exception ex) when (ex.Message == "EMAIL_NOT_VERIFIED")
        {
            return StatusCode(403, new { message = "EMAIL_NOT_VERIFIED" });
        }
        catch (Exception)
        {
            return Unauthorized(new { message = "INVALID_CREDENTIALS" });
        }
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] VerifyEmailRequest request)
    {
        var command = new VerifyEmailCommand(request.Email, request.Otp);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request)
    {
        try 
        {
            var command = new ResendVerificationEmailCommand(request.Email);
            await _sender.Send(command);
            return Ok(new { message = "Verification email sent if account exists" });
        }
        catch (Exception ex) when (ex.Message == "TOO_MANY_ATTEMPTS")
        {
            return StatusCode(429, new { message = "TOO_MANY_ATTEMPTS" });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordCommand command)
    {
        await _sender.Send(command);
        return Ok(new { message = "If the email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordCommand command)
    {
        try
        {
            await _sender.Send(command);
            return Ok(new { message = "Password reset successfully." });
        }
        catch (Exception ex) when (ex.Message == "Invalid or expired token.")
        {
            return BadRequest(new { message = "INVALID_TOKEN" });
        }
        catch (Exception ex) when (ex.Message.StartsWith("Password must be"))
        {
             return BadRequest(new { message = "WEAK_PASSWORD" });
        }
        catch (Exception) 
        {
             // Generic error for Invalid Request (User not found) to allow safe failure
             return BadRequest(new { message = "RESET_PASSWORD_FAILED" });
        }
    }
}

public record ResendVerificationRequest(string Email);
