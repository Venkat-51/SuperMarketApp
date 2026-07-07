namespace SuperMarketAPI.Models;

public enum DiscountType { Flat, Percentage }

public class Coupon
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; } = DiscountType.Flat;
    public decimal DiscountValue { get; set; }
    public decimal MinOrder { get; set; }
    public decimal? MaxDiscount { get; set; }  // cap for percentage discount
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
}
