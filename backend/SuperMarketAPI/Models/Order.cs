namespace SuperMarketAPI.Models;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Processing,
    OutForDelivery,
    Delivered,
    Cancelled
}

public enum PaymentMethod
{
    COD,
    UPI,
    Card,
    NetBanking
}

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? AddressId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;
    public string? PaymentId { get; set; }        // Razorpay payment_id
    public string? RazorpayOrderId { get; set; }  // Razorpay order_id
    public decimal Total { get; set; }
    public decimal DeliveryFee { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Address? Address { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
