using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db) => _db = db;

    /// <summary>GET /api/products — List products with optional filters</summary>
    [HttpGet("products")]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] bool? inStock,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category.ToLower() != "all")
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(q) ||
                (p.Brand != null && p.Brand.ToLower().Contains(q)) ||
                p.Category.ToLower().Contains(q));
        }

        if (inStock.HasValue)
            query = query.Where(p => p.InStock == inStock.Value);

        var total = await query.CountAsync();
        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new ProductListResponse(products.Select(ToDto), total, page, pageSize));
    }

    /// <summary>GET /api/products/{id} — Single product</summary>
    [HttpGet("products/{id:int}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _db.Products.FindAsync(id);
        return product is null ? NotFound() : Ok(ToDto(product));
    }

    /// <summary>GET /api/categories — All categories</summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var cats = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync();
        return Ok(cats.Select(c => new CategoryDto(c.Id, c.Name, c.Icon)));
    }

    private static ProductDto ToDto(Product p) => new(
        p.Id, p.Name, p.Brand, p.ImageUrl, p.Price, p.Mrp, p.Weight, p.Category, p.InStock,
        p.Mrp > 0 ? (int)Math.Round((p.Mrp - p.Price) / p.Mrp * 100) : 0
    );
}
