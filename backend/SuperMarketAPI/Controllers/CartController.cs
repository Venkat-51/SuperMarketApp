using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _db;
    public CartController(AppDbContext db) => _db = db;

    /// <summary>GET /api/cart — Fetch user's saved cart</summary>
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var items = await _db.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId.Value)
            .ToListAsync();

        return Ok(BuildResponse(items));
    }

    /// <summary>POST /api/cart/sync — Sync frontend cart to server</summary>
    [HttpPost("sync")]
    public async Task<IActionResult> SyncCart([FromBody] CartSyncRequest req)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        // Remove existing cart
        var existing = _db.CartItems.Where(c => c.UserId == userId.Value);
        _db.CartItems.RemoveRange(existing);

        // Add new items (skip invalid products)
        var productIds = req.Items.Select(i => i.ProductId).ToList();
        var products   = await _db.Products.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);

        foreach (var item in req.Items.Where(i => i.Quantity > 0 && products.ContainsKey(i.ProductId)))
        {
            _db.CartItems.Add(new CartItem
            {
                UserId    = userId.Value,
                ProductId = item.ProductId,
                Quantity  = item.Quantity,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        await _db.SaveChangesAsync();

        var saved = await _db.CartItems.Include(c => c.Product).Where(c => c.UserId == userId.Value).ToListAsync();
        return Ok(BuildResponse(saved));
    }

    /// <summary>DELETE /api/cart — Clear cart</summary>
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        _db.CartItems.RemoveRange(_db.CartItems.Where(c => c.UserId == userId.Value));
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private static CartResponse BuildResponse(IEnumerable<CartItem> items)
    {
        var dtos = items.Select(c => new CartItemDto(
            c.ProductId, c.Product.Name, c.Product.Brand, c.Product.ImageUrl,
            c.Product.Price, c.Product.Mrp, c.Product.Weight, c.Quantity)).ToList();
        var total       = dtos.Sum(d => d.Price * d.Quantity);
        var deliveryFee = total >= 299 ? 0 : (dtos.Count > 0 ? 40 : 0);
        return new CartResponse(dtos, total, deliveryFee, total + deliveryFee);
    }

    private int? GetUserId()
    {
        var c = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
             ?? User.FindFirst("sub");
        return c is not null && int.TryParse(c.Value, out var id) ? id : null;
    }
}
