using Antigaspi.Application.Dtos;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Antigaspi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IUserRepository _userRepository;

    public AdminController(ISellerRepository sellerRepository, IUserRepository userRepository)
    {
        _sellerRepository = sellerRepository;
        _userRepository = userRepository;
    }

    [HttpGet("users-overview")]
    public async Task<IActionResult> GetUsersOverview()
    {
        var users = await _userRepository.GetUsersWithDetailsAsync();
        return Ok(users);
    }

    [HttpGet("sellers")]
    public async Task<IActionResult> GetAllSellers()
    {
        var sellers = await _sellerRepository.GetAllAsync();
        return Ok(sellers);
    }

    [HttpPost("users/{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();
        if (user.Role == UserRole.ADMIN) return BadRequest("Cannot deactivate an admin account.");

        user.Deactivate();
        await _userRepository.UpdateAsync(user);

        // Optional: If they are a seller, maybe suspend the seller record too?
        // For now, user deactivation blocks login, which is the primary goal.
        // We could also update the seller status if we wanted to be thorough.
        var seller = await _sellerRepository.GetByUserIdAsync(id);
        if (seller != null)
        {
            seller.Suspend();
            await _sellerRepository.UpdateAsync(seller);
        }

        return Ok(user);
    }

    [HttpPost("users/{id}/activate")]
    public async Task<IActionResult> ActivateUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();
        // Admins are always active, but just in case
        if (user.Role == UserRole.ADMIN) return BadRequest("Cannot modify an admin account.");

        user.Activate();
        await _userRepository.UpdateAsync(user);

        var seller = await _sellerRepository.GetByUserIdAsync(id);
        if (seller != null)
        {
            seller.Activate();
            await _sellerRepository.UpdateAsync(seller);
        }

        return Ok(user);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();
        if (user.Role == UserRole.ADMIN) return BadRequest("Cannot delete an admin account.");

        var seller = await _sellerRepository.GetByUserIdAsync(id);
        if (seller != null)
        {
             // If manual deletion of offers is needed, do it here.
             await _sellerRepository.DeleteAsync(seller);
        }

        await _userRepository.DeleteAsync(user);
        return NoContent();
    }
}
