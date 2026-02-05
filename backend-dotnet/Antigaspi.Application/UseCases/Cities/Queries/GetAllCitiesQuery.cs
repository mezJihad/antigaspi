using Antigaspi.Application.Repositories;
using MediatR;

namespace Antigaspi.Application.UseCases.Cities.Queries;

public record GetAllCitiesQuery(bool OnlyWithActiveOffers = false, string? Country = null) : IRequest<List<CityDto>>;

public class GetAllCitiesQueryHandler : IRequestHandler<GetAllCitiesQuery, List<CityDto>>
{
    private readonly ICityRepository _cityRepository;
    private readonly IOfferRepository _offerRepository;

    public GetAllCitiesQueryHandler(ICityRepository cityRepository, IOfferRepository offerRepository)
    {
        _cityRepository = cityRepository;
        _offerRepository = offerRepository;
    }

    public async Task<List<CityDto>> Handle(GetAllCitiesQuery request, CancellationToken cancellationToken)
    {
        var cities = await _cityRepository.GetAllAsync(cancellationToken);

        if (request.OnlyWithActiveOffers)
        {
            var offers = await _offerRepository.GetAllAsync(cancellationToken);
            var now = DateTime.UtcNow;
            
            var activeOffersQuery = offers
                .Where(o => 
                    o.Status == Domain.Enums.OfferStatus.PUBLISHED && 
                    o.StartDate <= now && 
                    (!o.EndDate.HasValue || o.EndDate > now));

            // Filter by Country if provided
            if (!string.IsNullOrEmpty(request.Country))
            {
                activeOffersQuery = activeOffersQuery.Where(o => 
                    string.Equals(o.Seller?.Address?.Country, request.Country, StringComparison.OrdinalIgnoreCase)
                );
            }

            var activeCityNames = activeOffersQuery
                .Select(o => o.Seller?.Address?.City)
                .Where(c => !string.IsNullOrEmpty(c))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            cities = cities.Where(c => 
                activeCityNames.Contains(c.NameFr) || 
                (c.NameEn != null && activeCityNames.Contains(c.NameEn)) || 
                (c.NameAr != null && activeCityNames.Contains(c.NameAr))
            ).ToList();
        }

        return cities.Select(c => new CityDto
        {
            Id = c.Id,
            NameFr = c.NameFr,
            NameAr = c.NameAr,
            NameEn = c.NameEn
        }).ToList();
    }
}

public class CityDto
{
    public int Id { get; set; }
    public string NameFr { get; set; }
    public string NameAr { get; set; }
    public string NameEn { get; set; }
}
