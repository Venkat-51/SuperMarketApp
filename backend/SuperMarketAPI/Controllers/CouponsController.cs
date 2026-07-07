using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController : ControllerBase
{
    private readonly AppDbContext _db;
    public CouponsController(AppDbContext db) => _db = db;

    /// <summary>POST /api/coupons/validate — Validate a coupon code</summary>
    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidateCouponRequest req)
    {
        var coupon = await _db.Coupons.FirstOrDefaultAsync(c =>
            c.Code == req.Code.ToUpper() && c.IsActive);

        if (coupon is null)
            return Ok(new CouponValidationResponse(false, "Invalid coupon code.", null, null, 0, 0, req.OrderTotal));

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt < DateTime.UtcNow)
            return Ok(new CouponValidationResponse(false, "This coupon has expired.", null, null, 0, 0, req.OrderTotal));

        if (req.OrderTotal < coupon.MinOrder)
            return Ok(new CouponValidationResponse(false,
                $"Minimum order of ₹{coupon.MinOrder} required for this coupon.",
                null, null, 0, 0, req.OrderTotal));

        decimal discount = coupon.DiscountType == DiscountType.Flat
            ? coupon.DiscountValue
            : Math.Min(req.OrderTotal * coupon.DiscountValue / 100, coupon.MaxDiscount ?? decimal.MaxValue);

        var finalTotal = Math.Max(0, req.OrderTotal - discount);

        return Ok(new CouponValidationResponse(
            true, null,
            coupon.Code,
            coupon.DiscountType.ToString(),
            coupon.DiscountValue,
            discount,
            finalTotal
        ));
    }
}
