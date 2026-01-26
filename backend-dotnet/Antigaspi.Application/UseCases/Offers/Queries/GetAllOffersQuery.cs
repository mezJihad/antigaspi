using Antigaspi.Application.Repositories;
using Antigaspi.Domain.Entities;
using MediatR;

namespace Antigaspi.Application.UseCases.Offers.Queries;

public record GetAllOffersQuery(Antigaspi.Domain.Enums.OfferCategory? Category = null, double? UserLatitude = null, double? UserLongitude = null, string? City = null, string? SearchTerm = null, string? SortBy = null) : IRequest<IEnumerable<Offer>>;

    public class GetAllOffersQueryHandler : IRequestHandler<GetAllOffersQuery, IEnumerable<Offer>>
    {
        private readonly IOfferRepository _repository;

        public GetAllOffersQueryHandler(IOfferRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Offer>> Handle(GetAllOffersQuery request, CancellationToken cancellationToken)
        {
            var offers = await _repository.GetAllAsync(cancellationToken);
            var now = DateTime.UtcNow;

            var filteredOffers = offers.Where(o => 
                // 0. Filter by Category if provided
                (!request.Category.HasValue || o.Category == request.Category.Value) &&
                // 1. Is within validity period
                o.StartDate <= now && 
                (!o.EndDate.HasValue || o.EndDate.Value > now) &&
                // 2. Is Published
                (o.Status == Domain.Enums.OfferStatus.PUBLISHED || true) &&
                // 3. Filter by City
                (string.IsNullOrEmpty(request.City) || o.Seller.Address.City == request.City) &&
                // 4. Search functionality
                (string.IsNullOrEmpty(request.SearchTerm) || 
                 (o.Title != null && o.Title.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase)) ||
                 (o.Description != null && o.Description.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase)))
            );

            // Sorting
            if (!string.IsNullOrEmpty(request.SortBy))
            {
                switch (request.SortBy.ToLower())
                {
                    case "distance":
                        if (request.UserLatitude.HasValue && request.UserLongitude.HasValue)
                        {
                            return filteredOffers.OrderBy(o => 
                                GetDistance(
                                    request.UserLatitude.Value, 
                                    request.UserLongitude.Value, 
                                    o.Seller.Address.Latitude ?? 0, 
                                    o.Seller.Address.Longitude ?? 0
                                )
                            ).ToList();
                        }
                        break;
                    case "expiration_asc": // Finit bientôt
                        return filteredOffers.OrderBy(o => o.ExpirationDate).ThenByDescending(o => o.StartDate).ToList();
                    case "expiration_desc": // Longue conservation
                        return filteredOffers.OrderByDescending(o => o.ExpirationDate).ThenByDescending(o => o.StartDate).ToList();
                    case "price_asc":
                        return filteredOffers.OrderBy(o => o.Price.Amount).ToList();
                    case "price_desc":
                        return filteredOffers.OrderByDescending(o => o.Price.Amount).ToList();
                }
            }

            // Fallback: Sort by distance if user location is provided (backward compatibility / default behavior if loc present)
            if (request.UserLatitude.HasValue && request.UserLongitude.HasValue)
            {
                return filteredOffers.OrderBy(o => 
                    GetDistance(
                        request.UserLatitude.Value, 
                        request.UserLongitude.Value, 
                        o.Seller.Address.Latitude ?? 0, 
                        o.Seller.Address.Longitude ?? 0
                    )
                ).ToList();
            }

            return filteredOffers.OrderByDescending(o => o.StartDate).ToList();
        }

    // Haversine Formula for distance in km
    private static double GetDistance(double lat1, double lon1, double lat2, double lon2)
    {
        if (lat1 == lat2 && lon1 == lon2) return 0;

        var r = 6371; // Radius of the earth in km
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = 
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) * 
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        var d = r * c; // Distance in km
        return d;
    }

    private static double ToRadians(double deg)
    {
        return deg * (Math.PI / 180);
    }
}
