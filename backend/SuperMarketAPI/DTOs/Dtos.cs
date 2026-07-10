using System.ComponentModel.DataAnnotations;

namespace SuperMarketAPI.DTOs;

// ── Auth ─────────────────────────────────────────────────────────────────────
public record SendOtpRequest([Required, StringLength(10, MinimumLength = 10)] string Phone);

public record VerifyOtpRequest(
    [Required, StringLength(10, MinimumLength = 10)] string Phone,
    [Required, StringLength(6, MinimumLength = 4)] string Otp,
    string? Name
);

public record AuthResponse(string Token, UserDto User);

// ── User ─────────────────────────────────────────────────────────────────────
public record UserDto(int Id, string Name, string Phone, string? Email, DateTime CreatedAt);

public record UpdateProfileRequest(
    [Required, StringLength(80, MinimumLength = 2)] string Name,
    [EmailAddress] string? Email
);

// ── Product ──────────────────────────────────────────────────────────────────
public record ProductDto(
    int Id,
    string Name,
    string? Brand,
    string ImageUrl,
    decimal Price,
    decimal Mrp,
    string Weight,
    string Category,
    bool InStock,
    int DiscountPercent
);

public record ProductListResponse(IEnumerable<ProductDto> Products, int Total, int Page, int PageSize);

// ── Category ─────────────────────────────────────────────────────────────────
public record CategoryDto(int Id, string Name, string Icon);

// ── Address ──────────────────────────────────────────────────────────────────
public record AddressDto(int Id, string Label, string Line1, string City, string State, string Pincode, bool IsDefault);

public record CreateAddressRequest(
    [Required] string Label,
    [Required] string Line1,
    [Required] string City,
    [Required] string State,
    [Required, StringLength(6, MinimumLength = 6)] string Pincode,
    bool IsDefault = false
);

// ── Cart ─────────────────────────────────────────────────────────────────────
public record CartSyncRequest(IEnumerable<CartSyncItem> Items);
public record CartSyncItem(int ProductId, int Quantity);
public record CartItemDto(int ProductId, string ProductName, string? Brand, string ImageUrl, decimal Price, decimal Mrp, string Weight, int Quantity);
public record CartResponse(IEnumerable<CartItemDto> Items, decimal Total, decimal DeliveryFee, decimal GrandTotal);

// ── Order ─────────────────────────────────────────────────────────────────────
public record PlaceOrderRequest(
    [Required] IEnumerable<OrderItemRequest> Items,
    int? AddressId,
    [Required] string PaymentMethod,  // "COD", "UPI", "Card", "NetBanking"
    string? PaymentId,
    string? RazorpayOrderId,
    string? CouponCode
);

public record OrderItemRequest(int ProductId, int Quantity);

public record OrderDto(
    int Id,
    string Status,
    string PaymentMethod,
    string? PaymentId,
    decimal Total,
    decimal DeliveryFee,
    DateTime CreatedAt,
    AddressDto? Address,
    IEnumerable<OrderItemDto> Items
);

public record OrderItemDto(
    int ProductId,
    string ProductName,
    string? ProductImage,
    decimal Price,
    decimal Mrp,
    string Weight,
    int Quantity
);

// ── Payment ───────────────────────────────────────────────────────────────────
public record CreateRazorpayOrderRequest([Required] decimal Amount, string? Currency = "INR");

public record RazorpayOrderResponse(string OrderId, decimal Amount, string Currency, string KeyId);

public record VerifyPaymentRequest(
    [Required] string RazorpayOrderId,
    [Required] string RazorpayPaymentId,
    [Required] string RazorpaySignature
);

// ── Coupon ───────────────────────────────────────────────────────────────────
public record ValidateCouponRequest([Required] string Code, decimal OrderTotal);

public record CouponValidationResponse(
    bool IsValid,
    string? Error,
    string? Code,
    string? DiscountType,
    decimal DiscountValue,
    decimal Discount,
    decimal FinalTotal
);

// ── Wishlist ──────────────────────────────────────────────────────────────────
public record WishlistItemDto(int ProductId, ProductDto Product, DateTime AddedAt);

// ── Reviews ───────────────────────────────────────────────────────────────────
public record ReviewDto(int Id, int ProductId, int UserId, string UserName, int Rating, string? Comment, DateTime CreatedAt);

public record CreateReviewRequest(
    [Required] int ProductId,
    [Required, Range(1, 5)] int Rating,
    [StringLength(1000)] string? Comment
);
