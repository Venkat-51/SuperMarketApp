using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;
using SuperMarketAPI.Services;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailService _emailService;
    private readonly PdfInvoiceService _pdfService;
    private readonly ILogger<OrdersController> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public OrdersController(AppDbContext db, EmailService emailService, PdfInvoiceService pdfService, ILogger<OrdersController> logger, IServiceScopeFactory scopeFactory)
    {
        _db = db;
        _emailService = emailService;
        _pdfService = pdfService;
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    /// <summary>POST /api/orders — Place a new order</summary>
    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest req)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        // Retrieve existing products for matching items
        var productIds = req.Items.Select(i => i.ProductId).Distinct().ToList();
        var existingProducts = await _db.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();
        var productDict = existingProducts.ToDictionary(p => p.Id);

        var validItems = req.Items.ToList();

        decimal itemTotal = validItems.Sum(i =>
        {
            if (i.Price.HasValue && i.Price.Value > 0)
                return i.Price.Value * i.Quantity;
            if (productDict.TryGetValue(i.ProductId, out var p))
                return p.Price * i.Quantity;
            return 30m * i.Quantity;
        });

        decimal deliveryFee = itemTotal >= 299 ? 0 : 40;
        decimal grandTotal  = itemTotal + deliveryFee;

        // Apply coupon if present
        if (!string.IsNullOrWhiteSpace(req.CouponCode))
        {
            var coupon = await _db.Coupons.FirstOrDefaultAsync(c =>
                c.Code == req.CouponCode.ToUpper() && c.IsActive);
            if (coupon != null && itemTotal >= coupon.MinOrder)
            {
                decimal discount = coupon.DiscountType == DiscountType.Flat
                    ? coupon.DiscountValue
                    : Math.Min(itemTotal * coupon.DiscountValue / 100, coupon.MaxDiscount ?? decimal.MaxValue);
                grandTotal = Math.Max(0, itemTotal - discount) + deliveryFee;
            }
        }

        var paymentMethod = Enum.TryParse<PaymentMethod>(req.PaymentMethod, true, out var pm) ? pm : PaymentMethod.COD;

        var order = new Order
        {
            UserId        = userId.Value,
            AddressId     = req.AddressId,
            Status        = OrderStatus.Confirmed,
            PaymentMethod = paymentMethod,
            PaymentId     = req.PaymentId,
            RazorpayOrderId = req.RazorpayOrderId,
            Total         = grandTotal,
            DeliveryFee   = deliveryFee,
            Items         = validItems.Select(i =>
            {
                if (productDict.TryGetValue(i.ProductId, out var p))
                {
                    var resolvedWeight = !string.IsNullOrWhiteSpace(i.Weight) ? i.Weight
                                       : (!string.IsNullOrWhiteSpace(p.Weight) ? p.Weight
                                       : (!string.IsNullOrWhiteSpace(p.Unit) ? p.Unit : "1 unit"));
                    var resolvedPrice  = (i.Price.HasValue && i.Price.Value > 0) ? i.Price.Value : p.Price;

                    return new OrderItem
                    {
                        ProductId    = p.Id,
                        ProductName  = p.Name,
                        ProductImage = p.ImageUrl,
                        Price        = resolvedPrice,
                        Mrp          = p.Mrp > 0 ? p.Mrp : resolvedPrice,
                        Weight       = resolvedWeight,
                        Quantity     = i.Quantity,
                    };
                }

                var fallbackWeight = !string.IsNullOrWhiteSpace(i.Weight) ? i.Weight : "1 unit";
                var fallbackPrice  = (i.Price.HasValue && i.Price.Value > 0) ? i.Price.Value : 30m;

                return new OrderItem
                {
                    ProductId    = i.ProductId,
                    ProductName  = $"Grocery Product #{i.ProductId}",
                    ProductImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
                    Price        = fallbackPrice,
                    Mrp          = fallbackPrice,
                    Weight       = fallbackWeight,
                    Quantity     = i.Quantity,
                };
            }).ToList(),
        };

        _db.Orders.Add(order);

        // Clear server-side cart
        var cartItems = _db.CartItems.Where(c => c.UserId == userId.Value);
        _db.CartItems.RemoveRange(cartItems);

        await _db.SaveChangesAsync();

        // Send Invoice PDF to customer and owner asynchronously via Gmail
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var scopedDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var fullOrder = await scopedDb.Orders
                    .Include(o => o.Items)
                    .Include(o => o.Address)
                    .FirstOrDefaultAsync(o => o.Id == order.Id);

                var customer = await scopedDb.Users.FindAsync(userId.Value);

                if (fullOrder != null && customer != null)
                {
                    var pdfBytes = _pdfService.GenerateInvoicePdf(fullOrder, customer);
                    var customerEmail = customer.Email ?? "";
                    var subject = $"Order Confirmed! Invoice #{fullOrder.Id} - Super Market App";
                    var bodyHtml = $"""
                        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                          <h2 style="color: #FF9933; margin-top: 0;">Order Confirmation & Invoice</h2>
                          <p>Hi <strong>{(string.IsNullOrWhiteSpace(customer.Name) ? "Customer" : customer.Name)}</strong>,</p>
                          <p>Thank you for shopping with <strong>Super Market App</strong>! Your order <strong>#{fullOrder.Id}</strong> has been successfully placed.</p>
                          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p style="margin: 5px 0;"><strong>Order ID:</strong> #{fullOrder.Id}</p>
                            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹{fullOrder.Total:F2}</p>
                            <p style="margin: 5px 0;"><strong>Payment Method:</strong> {fullOrder.PaymentMethod}</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> {fullOrder.Status}</p>
                          </div>
                          <p>Please find attached your official PDF invoice for this order.</p>
                          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                          <p style="font-size: 12px; color: #777;">Super Market App Team</p>
                        </div>
                    """;

                    await _emailService.SendOrderInvoiceEmailAsync(
                        customerEmail,
                        subject,
                        bodyHtml,
                        pdfBytes,
                        $"Invoice_Order_{fullOrder.Id}.pdf"
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send order invoice email for Order #{OrderId}", order.Id);
            }
        });

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, await BuildOrderDto(order.Id));
    }

    /// <summary>GET /api/orders — My order history</summary>
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var orders = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Address)
            .Where(o => o.UserId == userId.Value)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(orders.Select(ToOrderDto));
    }

    /// <summary>GET /api/orders/{id} — Single order detail</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var userId = GetUserId();
        var dto    = await BuildOrderDto(id);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    /// <summary>PATCH /api/orders/{id}/cancel — Cancel pending order</summary>
    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId.Value);
        if (order is null) return NotFound();
        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            return BadRequest(new { error = "Order cannot be cancelled at this stage." });

        order.Status    = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Order cancelled successfully." });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private async Task<OrderDto?> BuildOrderDto(int id)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Address)
            .FirstOrDefaultAsync(o => o.Id == id);
        return order is null ? null : ToOrderDto(order);
    }

    private static OrderDto ToOrderDto(Order o) => new(
        o.Id,
        o.Status.ToString(),
        o.PaymentMethod.ToString(),
        o.PaymentId,
        o.Total,
        o.DeliveryFee,
        o.CreatedAt,
        o.Address is null ? null : new AddressDto(
            o.Address.Id, o.Address.Label, o.Address.Line1,
            o.Address.City, o.Address.State, o.Address.Pincode, o.Address.IsDefault),
        o.Items.Select(i => new OrderItemDto(
            i.ProductId, i.ProductName, i.ProductImage, i.Price, i.Mrp, i.Weight, i.Quantity))
    );

    private int? GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub");
        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }
}
