using MediatR;
using Microsoft.AspNetCore.Http;
using CsvHelper;
using System.Globalization;
using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using Antigaspi.Domain.ValueObjects;

namespace Antigaspi.Application.UseCases.Products.Commands;

public record ImportProductsCommand(Guid SellerId, IFormFile File) : IRequest<int>;

public class ImportProductsCommandHandler : IRequestHandler<ImportProductsCommand, int>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IProductRepository _productRepository;

    public ImportProductsCommandHandler(ISellerRepository sellerRepository, IProductRepository productRepository)
    {
        _sellerRepository = sellerRepository;
        _productRepository = productRepository;
    }

    public async Task<int> Handle(ImportProductsCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify Seller
        var seller = await _sellerRepository.GetByIdAsync(request.SellerId, cancellationToken);
        if (seller == null)
        {
            throw new KeyNotFoundException("Seller not found");
        }

        // 2. Parse CSV
        using var stream = request.File.OpenReadStream();
        using var reader = new StreamReader(stream);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

        var records = csv.GetRecords<ProductImportDto>().ToList();
        var products = new List<Product>();

        foreach (var record in records)
        {
            // Basic validation and mapping
            if (string.IsNullOrWhiteSpace(record.Title)) continue;

            if (!Enum.TryParse<Antigaspi.Domain.Enums.OfferCategory>(record.Category, true, out var category))
            {
                category = Antigaspi.Domain.Enums.OfferCategory.Grocery; // Default
            }

            var originalPrice = Money.From(record.OriginalPriceAmount, record.OriginalPriceCurrency ?? "MAD");

            var product = new Product(
                request.SellerId,
                record.Title,
                record.Description ?? "",
                category,
                originalPrice,
                record.PictureUrl ?? "",
                record.GTIN
            );

            // Set GTIN via reflection or update constructor if needed. 
            // Current constructor doesn't take GTIN but property exists.
            // Let's assume for now we ignore GTIN or update Product.cs to have SetGTIN method or public setter? 
            // Product properties are private set.
            // We need a way to set GTIN during creation.
            // I will update Product.cs later to allow setting GTIN via constructor or method.
            
            products.Add(product);
        }

        // 3. Persist
        foreach (var product in products)
        {
            await _productRepository.AddAsync(product, cancellationToken);
        }

        return products.Count;
    }
}

public class ProductImportDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public decimal OriginalPriceAmount { get; set; }
    public string? OriginalPriceCurrency { get; set; }
    public string? PictureUrl { get; set; }
    public string? GTIN { get; set; }
}
