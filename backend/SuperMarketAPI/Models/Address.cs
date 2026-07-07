namespace SuperMarketAPI.Models;

public class Address
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Label { get; set; } = "Home";  // Home / Work / Other
    public string Line1 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
