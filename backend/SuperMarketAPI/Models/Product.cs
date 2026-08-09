namespace SuperMarketAPI.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Mrp { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Weight { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Subcategory { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int StockQuantity { get; set; } = 50;
    public bool InStock { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
