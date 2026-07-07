using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrdersController(AppDbContext db) => _db = db;

    /// <summary>POST /api/orders — Place a new order</summary>
    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest req)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        // Validate products and compute totals
        var productIds = req.Items.Select(i => i.ProductId).ToList();
        var products   = await _db.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();

        if (products.Count != productIds.Count)
            return BadRequest(new { error = "One or more products not found." });

        if (products.Any(p => !p.InStock))
            return BadRequest(new { error = "Some products are out of stock." });

        decimal itemTotal = req.Items.Sum(i =>
        {
            var p = products.First(x => x.Id == i.ProductId);
            return p.Price * i.Quantity;
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
            Items         = req.Items.Select(i =>
            {
                var p = products.First(x => x.Id == i.ProductId);
                return new OrderItem
                {
                    ProductId    = p.Id,
                    ProductName  = p.Name,
                    ProductImage = p.ImageUrl,
                    Price        = p.Price,
                    Mrp          = p.Mrp,
                    Weight       = p.Weight,
                    Quantity     = i.Quantity,
                };
            }).ToList(),
        };

        _db.Orders.Add(order);

        // Clear server-side cart
        var cartItems = _db.CartItems.Where(c => c.UserId == userId.Value);
        _db.CartItems.RemoveRange(cartItems);

        await _db.SaveChangesAsync();

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
