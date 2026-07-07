namespace SuperMarketAPI.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;  // snapshot
    public string? ProductImage { get; set; }
    public decimal Price { get; set; }   // price at time of order
    public decimal Mrp { get; set; }
    public string Weight { get; set; } = string.Empty;
    public int Quantity { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
