using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;
using System.Security.Claims;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetProductReviews(int productId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(
                r.Id,
                r.ProductId,
                r.UserId,
                r.User != null ? r.User.Name : "Anonymous",
                r.Rating,
                r.Comment,
                r.CreatedAt
            ))
            .ToListAsync();

        return Ok(reviews);
    }

    [Authorize]
    [HttpGet("user")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetUserReviews()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
        {
            return Unauthorized();
        }

        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(
                r.Id,
                r.ProductId,
                r.UserId,
                r.User != null ? r.User.Name : "Anonymous",
                r.Rating,
                r.Comment,
                r.CreatedAt
            ))
            .ToListAsync();

        return Ok(reviews);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> AddReview(CreateReviewRequest request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
        {
            return Unauthorized();
        }

        // Verify that the user has ordered this product
        var hasOrdered = await _context.OrderItems
            .Include(oi => oi.Order)
            .AnyAsync(oi => oi.ProductId == request.ProductId && oi.Order!.UserId == userId);

        if (!hasOrdered)
        {
            return BadRequest(new { title = "You can only review products you have purchased." });
        }

        // Optional: Check if user already reviewed this product to prevent duplicate reviews
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.ProductId == request.ProductId && r.UserId == userId);

        if (existingReview != null)
        {
            return BadRequest(new { title = "You have already reviewed this product." });
        }

        var review = new Review
        {
            ProductId = request.ProductId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Fetch user to return the full DTO
        var user = await _context.Users.FindAsync(userId);

        var dto = new ReviewDto(
            review.Id,
            review.ProductId,
            review.UserId,
            user?.Name ?? "Anonymous",
            review.Rating,
            review.Comment,
            review.CreatedAt
        );

        return Ok(dto);
    }
}
