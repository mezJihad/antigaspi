namespace Antigaspi.Domain.ValueObjects;

public class Address
{
    public string Street { get; }
    public string City { get; }
    public string? ZipCode { get; }
    public string Country { get; }
    public double? Latitude { get; }
    public double? Longitude { get; }

    public Address(string street, string city, string? zipCode, string country = "France", double? latitude = null, double? longitude = null)
    {
        if (string.IsNullOrWhiteSpace(street) || string.IsNullOrWhiteSpace(city))
        {
            throw new ArgumentException("Address requires street and city");
        }

        Street = street;
        City = city;
        ZipCode = zipCode;
        Country = country;
        Latitude = latitude;
        Longitude = longitude;
    }

    public override string ToString()
    {
        return $"{Street}, {ZipCode} {City}, {Country}";
    }
}
