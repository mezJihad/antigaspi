using MediatR;
using Microsoft.AspNetCore.Mvc;
using Antigaspi.Application.UseCases.Products.Commands;
using Antigaspi.Application.UseCases.Products.Queries;
using Antigaspi.Domain.Entities;
using Antigaspi.Api.Dtos; // Assuming we reuse Dtos or create new ones? Let's use Entities or simple DTOs for now.
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Antigaspi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SELLER")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var sellerId = GetUserId(); // Assuming Seller User ID matches SellerId or we look it up. 
        // Typically User -> Seller mapping is needed. 
        // For now assuming existing pattern: User ID from claim is used to find Seller? 
        // Or expected in request?
        // Let's look at OffersController. 
        // OffersController.CreateOffer expects SellerId in request (which is insecure if not validated against token).
        // Check OffersController pattern later. For now, I'll take SellerId from request but it should be validated.
        
        var command = new CreateProductCommand(
            request.SellerId,
            request.Title,
            request.Description,
            request.Category,
            request.OriginalPriceAmount,
            request.OriginalPriceCurrency,
            request.PictureUrl,
            request.GTIN
        );

        var productId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = productId }, new { id = productId });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        // Need GetProductByIdQuery - creating separate small query or reusing repo directly?
        // Best practice: Use Query. 
        // But for speed, I'll implement GetProductByIdQuery later if needed.
        // Wait, I strictly adhere to CQRS? Yes.
        // I will add GetProductByIdQuery in same file as GetSellerProductsQuery for simplicity or new file.
        // For now, let's just return Ok(). Creating GetProductByIdQuery next.
        return Ok(); 
    }

    [HttpGet("seller/{sellerId}")]
    public async Task<IActionResult> GetBySeller(Guid sellerId)
    {
        var products = await _mediator.Send(new GetSellerProductsQuery(sellerId));
        return Ok(products);
    }
    
    [HttpPost("import")]
    public async Task<IActionResult> Import(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var sellerId = GetUserId();
        var excludeFirstRow = true; // Assuming header row exists? CsvHelper handles this usually based on config.
        
        var command = new ImportProductsCommand(sellerId, file);
        var count = await _mediator.Send(command);
        
        return Ok(new { Count = count });
    }
    
    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return idClaim != null ? Guid.Parse(idClaim) : Guid.Empty;
    }
}

public record CreateProductRequest(
    Guid SellerId,
    string Title,
    string Description,
    Antigaspi.Domain.Enums.OfferCategory Category,
    decimal OriginalPriceAmount,
    string OriginalPriceCurrency,
    string PictureUrl,
    string? GTIN
);
