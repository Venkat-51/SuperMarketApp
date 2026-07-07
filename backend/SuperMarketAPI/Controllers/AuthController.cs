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

    /// <summary>POST /api/auth/send-otp — Send OTP to phone</summary>
    [HttpPost("send-otp")]
    public IActionResult SendOtp([FromBody] SendOtpRequest req)
    {
        var generatedOtp = _otp.GenerateAndStore(req.Phone);
        // In production: send SMS. For dev, return in response.
        return Ok(new { message = "OTP sent successfully.", otp = generatedOtp }); // Remove otp field in prod!
    }

    /// <summary>POST /api/auth/verify-otp — Verify OTP and return JWT</summary>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest req)
    {
        if (!_otp.Verify(req.Phone, req.Otp))
            return BadRequest(new { error = "Invalid or expired OTP." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Phone == req.Phone);
        if (user is null)
        {
            // Auto-register new user
            user = new User
            {
                Phone = req.Phone,
                Name  = req.Name ?? "Customer",
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

    private int? GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub");
        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    private static UserDto ToUserDto(User u) =>
        new(u.Id, u.Name, u.Phone, u.Email, u.CreatedAt);
}
