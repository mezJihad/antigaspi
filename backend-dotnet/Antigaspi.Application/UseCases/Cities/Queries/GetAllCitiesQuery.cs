using Antigaspi.Application.Repositories;
using MediatR;

namespace Antigaspi.Application.UseCases.Cities.Queries;

public record GetAllCitiesQuery() : IRequest<List<CityDto>>;

public class GetAllCitiesQueryHandler : IRequestHandler<GetAllCitiesQuery, List<CityDto>>
{
    private readonly ICityRepository _cityRepository;

    public GetAllCitiesQueryHandler(ICityRepository cityRepository)
    {
        _cityRepository = cityRepository;
    }

    public async Task<List<CityDto>> Handle(GetAllCitiesQuery request, CancellationToken cancellationToken)
    {
        var cities = await _cityRepository.GetAllAsync(cancellationToken);

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
