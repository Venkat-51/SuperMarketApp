using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly AppDbContext _db;
    public WishlistController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var items = await _db.WishlistItems
            .Include(w => w.Product)
            .Where(w => w.UserId == userId.Value)
            .OrderByDescending(w => w.AddedAt)
            .ToListAsync();

        return Ok(items.Select(w => new WishlistItemDto(
            w.ProductId,
            ToProductDto(w.Product),
            w.AddedAt)));
    }

    [HttpPost("{productId:int}")]
    public async Task<IActionResult> AddToWishlist(int productId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var exists = await _db.WishlistItems.AnyAsync(w => w.UserId == userId.Value && w.ProductId == productId);
        if (exists) return Ok(new { message = "Already in wishlist." });

        var product = await _db.Products.FindAsync(productId);
        if (product is null) return NotFound();

        _db.WishlistItems.Add(new WishlistItem { UserId = userId.Value, ProductId = productId });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Added to wishlist." });
    }

    [HttpDelete("{productId:int}")]
    public async Task<IActionResult> RemoveFromWishlist(int productId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var item = await _db.WishlistItems.FirstOrDefaultAsync(w => w.UserId == userId.Value && w.ProductId == productId);
        if (item is null) return NotFound();

        _db.WishlistItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ProductDto ToProductDto(Product p) => new(
        p.Id, p.Name, p.Brand, p.ImageUrl, p.Price, p.Mrp, p.Weight, p.Category, p.InStock,
        p.Mrp > 0 ? (int)Math.Round((p.Mrp - p.Price) / p.Mrp * 100) : 0);

    private int? GetUserId()
    {
        var c = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return c is not null && int.TryParse(c.Value, out var id) ? id : null;
    }
}
