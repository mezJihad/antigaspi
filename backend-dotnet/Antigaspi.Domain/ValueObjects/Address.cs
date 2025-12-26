namespace Antigaspi.Domain.ValueObjects;

public class Address
{
    public string Street { get; }
    public string City { get; }
    public string ZipCode { get; }
    public string Country { get; }

    public Address(string street, string city, string zipCode, string country = "France")
    {
        if (string.IsNullOrWhiteSpace(street) || string.IsNullOrWhiteSpace(city) || string.IsNullOrWhiteSpace(zipCode))
        {
            throw new ArgumentException("Address requires street, city, and zipCode");
        }

        Street = street;
        City = city;
        ZipCode = zipCode;
        Country = country;
    }

    public override string ToString()
    {
        return $"{Street}, {ZipCode} {City}, {Country}";
    }
}
