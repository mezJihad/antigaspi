namespace Antigaspi.Domain.ValueObjects;

public class Money : IEquatable<Money>
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "EUR")
    {
        if (amount < 0)
            throw new ArgumentException("Money amount cannot be negative", nameof(amount));

        Amount = amount;
        Currency = currency;
    }

    public static Money From(decimal amount, string currency = "EUR")
    {
        return new Money(amount, currency);
    }

    public bool IsGreaterThan(Money other)
    {
        CheckCurrency(other);
        return Amount > other.Amount;
    }

    public bool IsLessThan(Money other)
    {
        CheckCurrency(other);
        return Amount < other.Amount;
    }

    private void CheckCurrency(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Currency mismatch: cannot compare {Currency} with {other.Currency}");
    }

    public bool Equals(Money? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return Amount == other.Amount && Currency == other.Currency;
    }

    public override bool Equals(object? obj)
    {
        if (obj is null) return false;
        if (ReferenceEquals(this, obj)) return true;
        if (obj.GetType() != this.GetType()) return false;
        return Equals((Money)obj);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Amount, Currency);
    }

    public override string ToString()
    {
        return $"{Amount} {Currency}";
    }
}
