using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db) => _db = db;

    // ── 1. Overview & Statistics ─────────────────────────────────────────────
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var now = DateTime.UtcNow;
        var todayStart = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);

        var totalProducts      = await _db.Products.CountAsync();
        var activeProducts     = await _db.Products.CountAsync(p => p.IsActive);
        var outOfStockProducts = await _db.Products.CountAsync(p => !p.InStock || p.StockQuantity <= 0);

        var totalOrders        = await _db.Orders.CountAsync();
        var pendingOrders      = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed || o.Status == OrderStatus.Processing);
        var completedOrders    = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Delivered);

        var totalUsers         = await _db.Users.CountAsync(u => u.Role != "Admin");

        var todayOrdersList    = await _db.Orders.Where(o => o.CreatedAt >= todayStart).ToListAsync();
        var todayOrdersCount   = todayOrdersList.Count;
        var todayRevenue       = todayOrdersList.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.Total);

        // Category distribution
        var categoryDist = await _db.Products
            .GroupBy(p => p.Category)
            .Select(g => new CategoryDistItem(g.Key, g.Count()))
            .ToListAsync();

        // Sales over last 7 days
        var sevenDaysAgo = todayStart.AddDays(-6);
        var recentOrders = await _db.Orders
            .Where(o => o.CreatedAt >= sevenDaysAgo && o.Status != OrderStatus.Cancelled)
            .ToListAsync();

        var salesOverTime = Enumerable.Range(0, 7).Select(offset =>
        {
            var date = sevenDaysAgo.AddDays(offset);
            var dateStr = date.ToString("MMM dd");
            var dayOrders = recentOrders.Where(o => o.CreatedAt.Date == date.Date).ToList();
            return new SalesOverTimeItem(dateStr, dayOrders.Sum(o => o.Total), dayOrders.Count);
        }).ToList();

        return Ok(new AdminOverviewStats(
            totalProducts, activeProducts, outOfStockProducts,
            totalOrders, pendingOrders, completedOrders,
            totalUsers, todayOrdersCount, todayRevenue,
            categoryDist, salesOverTime
        ));
    }

    // ── 2. Product Management ────────────────────────────────────────────────
    [HttpGet("products")]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? brand,
        [FromQuery] string? stockStatus, // "all", "instock", "outofstock"
        [FromQuery] bool? isActive,
        [FromQuery] string? sortBy,     // "price_asc", "price_desc", "stock_asc", "stock_desc", "newest"
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(q) ||
                (p.Brand != null && p.Brand.ToLower().Contains(q)) ||
                (p.Sku != null && p.Sku.ToLower().Contains(q)) ||
                p.Category.ToLower().Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(category) && category.ToLower() != "all")
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrWhiteSpace(brand) && brand.ToLower() != "all")
            query = query.Where(p => p.Brand == brand);

        if (!string.IsNullOrWhiteSpace(stockStatus))
        {
            if (stockStatus.ToLower() == "instock") query = query.Where(p => p.InStock && p.StockQuantity > 0);
            else if (stockStatus.ToLower() == "outofstock") query = query.Where(p => !p.InStock || p.StockQuantity <= 0);
        }

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        query = sortBy switch
        {
            "price_asc"  => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "stock_asc"  => query.OrderBy(p => p.StockQuantity),
            "stock_desc" => query.OrderByDescending(p => p.StockQuantity),
            _            => query.OrderByDescending(p => p.Id)
        };

        var total = await query.CountAsync();
        var products = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(new ProductListResponse(products.Select(ToProductDto), total, page, pageSize));
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest req)
    {
        if (!string.IsNullOrWhiteSpace(req.Sku))
        {
            var skuExists = await _db.Products.AnyAsync(p => p.Sku.ToLower() == req.Sku.Trim().ToLower());
            if (skuExists)
            {
                return BadRequest(new { error = $"Product SKU '{req.Sku}' already exists." });
            }
        }

        var product = new Product
        {
            Name          = req.Name.Trim(),
            Brand         = req.Brand?.Trim(),
            ImageUrl      = req.ImageUrl.Trim(),
            Price         = req.Price,
            Mrp           = req.Mrp,
            Sku           = string.IsNullOrWhiteSpace(req.Sku) ? $"SKU-{Guid.NewGuid().ToString("N")[..8].ToUpper()}" : req.Sku.Trim(),
            Weight        = req.Weight?.Trim() ?? "1 unit",
            Category      = req.Category.Trim(),
            Subcategory   = req.Subcategory?.Trim() ?? string.Empty,
            Description   = req.Description?.Trim() ?? string.Empty,
            Unit          = req.Unit?.Trim() ?? "unit",
            StockQuantity = req.StockQuantity,
            InStock       = req.InStock && req.StockQuantity > 0,
            IsActive      = req.IsActive,
            IsFeatured    = req.IsFeatured,
            CreatedAt     = DateTime.UtcNow,
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, ToProductDto(product));
    }

    [HttpPut("products/{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest req)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound(new { error = "Product not found." });

        if (!string.IsNullOrWhiteSpace(req.Sku) && req.Sku.Trim().ToLower() != product.Sku.ToLower())
        {
            var skuExists = await _db.Products.AnyAsync(p => p.Id != id && p.Sku.ToLower() == req.Sku.Trim().ToLower());
            if (skuExists)
            {
                return BadRequest(new { error = $"Product SKU '{req.Sku}' is already assigned to another product." });
            }
        }

        product.Name          = req.Name.Trim();
        product.Brand         = req.Brand?.Trim();
        product.ImageUrl      = req.ImageUrl.Trim();
        product.Price         = req.Price;
        product.Mrp           = req.Mrp;
        product.Sku           = string.IsNullOrWhiteSpace(req.Sku) ? product.Sku : req.Sku.Trim();
        product.Weight        = req.Weight?.Trim() ?? product.Weight;
        product.Category      = req.Category.Trim();
        product.Subcategory   = req.Subcategory?.Trim() ?? string.Empty;
        product.Description   = req.Description?.Trim() ?? string.Empty;
        product.Unit          = req.Unit?.Trim() ?? string.Empty;
        product.StockQuantity = req.StockQuantity;
        product.InStock       = req.InStock && req.StockQuantity > 0;
        product.IsActive      = req.IsActive;
        product.IsFeatured    = req.IsFeatured;

        await _db.SaveChangesAsync();
        return Ok(ToProductDto(product));
    }

    [HttpPatch("products/{id:int}/stock")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] int stockQuantity)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.StockQuantity = stockQuantity;
        product.InStock = stockQuantity > 0;
        await _db.SaveChangesAsync();

        return Ok(ToProductDto(product));
    }

    [HttpPatch("products/{id:int}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.IsActive = !product.IsActive;
        await _db.SaveChangesAsync();

        return Ok(ToProductDto(product));
    }

    [HttpDelete("products/{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        // Check if product is in active order items
        var inOrders = await _db.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (inOrders)
        {
            // Soft delete by deactivating
            product.IsActive = false;
            product.InStock  = false;
            await _db.SaveChangesAsync();
            return Ok(new { message = "Product has order history. It was marked inactive instead of hard deletion." });
        }

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── 3. Bulk CSV Import ────────────────────────────────────────────────────
    [HttpPost("products/bulk-import")]
    public async Task<IActionResult> BulkImport([FromBody] BulkImportRequest req)
    {
        if (req.Products == null || !req.Products.Any())
        {
            return BadRequest(new { error = "No products provided for import." });
        }

        var existingSkus = await _db.Products.Where(p => !string.IsNullOrEmpty(p.Sku)).Select(p => p.Sku.ToLower()).ToListAsync();
        var skuSet = new HashSet<string>(existingSkus);

        var newProducts = new List<Product>();
        var errors = new List<string>();

        int index = 1;
        foreach (var row in req.Products)
        {
            if (string.IsNullOrWhiteSpace(row.ProductName))
            {
                errors.Add($"Row {index}: Product Name is required.");
                index++;
                continue;
            }

            if (string.IsNullOrWhiteSpace(row.Category))
            {
                errors.Add($"Row {index}: Category is required for '{row.ProductName}'.");
                index++;
                continue;
            }

            var sku = string.IsNullOrWhiteSpace(row.Sku)
                ? $"SKU-{Guid.NewGuid().ToString("N")[..8].ToUpper()}"
                : row.Sku.Trim();

            if (skuSet.Contains(sku.ToLower()))
            {
                errors.Add($"Row {index}: Duplicate SKU '{sku}' found.");
                index++;
                continue;
            }

            skuSet.Add(sku.ToLower());

            newProducts.Add(new Product
            {
                Name          = row.ProductName.Trim(),
                Brand         = row.Brand?.Trim(),
                Sku           = sku,
                Category      = row.Category.Trim(),
                Subcategory   = row.Subcategory?.Trim() ?? string.Empty,
                Description   = row.Description?.Trim() ?? string.Empty,
                Price         = row.Price,
                Mrp           = row.Mrp > 0 ? row.Mrp : row.Price,
                StockQuantity = row.StockQuantity,
                Unit          = row.Unit?.Trim() ?? "unit",
                Weight        = row.Weight?.Trim() ?? "1 unit",
                ImageUrl      = string.IsNullOrWhiteSpace(row.ImageUrl) ? "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" : row.ImageUrl.Trim(),
                InStock       = row.StockQuantity > 0,
                IsActive      = row.IsActive,
                IsFeatured    = row.IsFeatured,
                CreatedAt     = DateTime.UtcNow,
            });

            index++;
        }

        if (newProducts.Any())
        {
            _db.Products.AddRange(newProducts);
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            importedCount = newProducts.Count,
            errorCount    = errors.Count,
            errors        = errors
        });
    }

    // ── 4. Order Management ──────────────────────────────────────────────────
    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? paymentStatus,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _db.Orders
            .Include(o => o.User)
            .Include(o => o.Address)
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.ToLower();
            query = query.Where(o =>
                o.Id.ToString().Contains(q) ||
                o.User.Name.ToLower().Contains(q) ||
                (o.User.Email != null && o.User.Email.ToLower().Contains(q)) ||
                o.User.Phone.Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
        {
            if (Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
            {
                query = query.Where(o => o.Status == orderStatus);
            }
        }

        var total = await query.CountAsync();
        var orders = await query.OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = orders.Select(o => new
        {
            id            = o.Id,
            userId        = o.UserId,
            userName      = o.User.Name,
            userEmail     = o.User.Email,
            userPhone     = o.User.Phone,
            status        = o.Status.ToString(),
            paymentMethod = o.PaymentMethod.ToString(),
            paymentId     = o.PaymentId,
            total         = o.Total,
            deliveryFee   = o.DeliveryFee,
            createdAt     = o.CreatedAt,
            itemsCount    = o.Items.Sum(i => i.Quantity),
            address       = o.Address == null ? null : new
            {
                o.Address.Label,
                o.Address.Line1,
                o.Address.City,
                o.Address.State,
                o.Address.Pincode
            },
            items         = o.Items.Select(i => new
            {
                i.ProductId,
                i.ProductName,
                i.ProductImage,
                i.Price,
                i.Mrp,
                i.Weight,
                i.Quantity
            })
        });

        return Ok(new { orders = dtos, total, page, pageSize });
    }

    [HttpPatch("orders/{id:int}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest req)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound(new { error = "Order not found." });

        if (Enum.TryParse<OrderStatus>(req.Status, true, out var newStatus))
        {
            order.Status    = newStatus;
            order.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(new { message = $"Order #{id} status updated to {newStatus}.", status = newStatus.ToString() });
        }

        return BadRequest(new { error = "Invalid status value." });
    }

    // ── 5. User Management ───────────────────────────────────────────────────
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _db.Users
            .Include(u => u.Orders)
            .Where(u => u.Role != "Admin")
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.ToLower();
            query = query.Where(u =>
                u.Name.ToLower().Contains(q) ||
                (u.Email != null && u.Email.ToLower().Contains(q)) ||
                u.Phone.Contains(q));
        }

        var total = await query.CountAsync();
        var users = await query.OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userList = users.Select(u => new
        {
            id          = u.Id,
            name        = u.Name,
            email       = u.Email,
            phone       = u.Phone,
            role        = u.Role,
            isActive    = u.IsActive,
            createdAt   = u.CreatedAt,
            lastLoginAt = u.LastLoginAt,
            ordersCount = u.Orders.Count,
            totalSpent  = u.Orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.Total)
        });

        return Ok(new { users = userList, total, page, pageSize });
    }

    [HttpPatch("users/{id:int}/status")]
    public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(new { error = "User not found." });

        user.IsActive = req.IsActive;
        if (!string.IsNullOrWhiteSpace(req.Role))
        {
            user.Role = req.Role;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = $"User #{id} account updated successfully." });
    }

    [HttpGet("users/{id:int}")]
    public async Task<IActionResult> GetUserDetail(int id)
    {
        var user = await _db.Users
            .Include(u => u.Orders)
                .ThenInclude(o => o.Items)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null) return NotFound();

        var orders = user.Orders.OrderByDescending(o => o.CreatedAt).Select(o => new
        {
            id          = o.Id,
            status      = o.Status.ToString(),
            total       = o.Total,
            createdAt   = o.CreatedAt,
            itemsCount  = o.Items.Sum(i => i.Quantity)
        });

        return Ok(new
        {
            id             = user.Id,
            name           = user.Name,
            email          = user.Email,
            phone          = user.Phone,
            role           = user.Role,
            isActive       = user.IsActive,
            createdAt      = user.CreatedAt,
            lastLoginAt    = user.LastLoginAt,
            totalOrders    = user.Orders.Count,
            completedOrders= user.Orders.Count(o => o.Status == OrderStatus.Delivered),
            cancelledOrders= user.Orders.Count(o => o.Status == OrderStatus.Cancelled),
            totalSpent     = user.Orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.Total),
            orders         = orders
        });
    }

    // ── Helper Mapping ───────────────────────────────────────────────────────
    private static ProductDto ToProductDto(Product p) => new(
        p.Id, p.Name, p.Brand, p.ImageUrl, p.Price, p.Mrp, p.Weight, p.Category, p.InStock,
        p.Mrp > 0 ? (int)Math.Round((p.Mrp - p.Price) / p.Mrp * 100) : 0,
        p.Sku ?? "", p.Subcategory ?? "", p.Description ?? "", p.Unit ?? "", p.StockQuantity,
        p.IsActive, p.IsFeatured, p.CreatedAt
    );
}
