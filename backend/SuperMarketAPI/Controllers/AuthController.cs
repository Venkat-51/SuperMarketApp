using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;
using SuperMarketAPI.Services;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;
    private readonly OtpService _otp;

    public AuthController(AppDbContext db, JwtService jwt, OtpService otp)
    {
        _db  = db;
        _jwt = jwt;
        _otp = otp;
    }

    /// <summary>POST /api/auth/send-otp — Send OTP to email address</summary>
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest req)
    {
        try
        {
            await _otp.GenerateAndSendAsync(req.Email);
            return Ok(new { message = "OTP sent successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Failed to send OTP: {ex.Message}" });
        }
    }

    /// <summary>POST /api/auth/verify-otp — Verify OTP and return JWT</summary>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest req)
    {
        if (!_otp.Verify(req.Email, req.Otp))
            return BadRequest(new { error = "Invalid or expired OTP." });

        var email = req.Email.ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            // Auto-register new user
            user = new User
            {
                Email = email,
                Phone = string.Empty,
                Name  = req.Name ?? string.Empty,
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        var token = _jwt.GenerateToken(user);
        return Ok(new AuthResponse(token, ToUserDto(user)));
    }

    /// <summary>GET /api/auth/me — Get current user</summary>
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        return Ok(ToUserDto(user));
    }

    /// <summary>PATCH /api/auth/me - Update current user's profile</summary>
    [HttpPatch("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest req)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.Name  = req.Name.Trim();
        user.Email = string.IsNullOrWhiteSpace(req.Email) ? user.Email : req.Email.Trim();

        await _db.SaveChangesAsync();
        return Ok(ToUserDto(user));
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub");
        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    private static UserDto ToUserDto(User u) =>
        new(u.Id, u.Name, u.Phone, u.Email, u.CreatedAt);
}
