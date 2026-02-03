namespace Antigaspi.Domain.Entities;

public class City
{
    public int Id { get; set; }
    public string NameFr { get; set; } = string.Empty; // e.g., Casablanca
    public string NameAr { get; set; } = string.Empty; // e.g., الدار البيضاء
    public string NameEn { get; set; } = string.Empty; // e.g., Casablanca
    public bool IsActive { get; set; } = true;
}
