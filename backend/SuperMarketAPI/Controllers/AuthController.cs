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

    public AuthController(AppDbContext db, JwtService jwt)
    {
        _db  = db;
        _jwt = jwt;
    }

    /// <summary>POST /api/auth/register — Create a new user account with Email & Password</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();

        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existingUser != null)
        {
            return BadRequest(new { error = "An account with this email address already exists. Please log in." });
        }

        var user = new User
        {
            Name         = req.Name.Trim(),
            Email        = email,
            Phone        = req.Phone?.Trim() ?? string.Empty,
            PasswordHash = PasswordHasher.Hash(req.Password),
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(user);
        return Ok(new AuthResponse(token, ToUserDto(user)));
    }

    /// <summary>POST /api/auth/login — Authenticate user with Email & Password</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return BadRequest(new { error = "No account found with this email address. Please register." });
        }

        if (!PasswordHasher.Verify(req.Password, user.PasswordHash))
        {
            return BadRequest(new { error = "Invalid password. Please check your password and try again." });
        }

        var token = _jwt.GenerateToken(user);
        return Ok(new AuthResponse(token, ToUserDto(user)));
    }

    /// <summary>POST /api/auth/google — Authenticate user with Google ID Token or payload</summary>
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest req)
    {
        try
        {
            string email = "";
            string name = "";

            // Parse ID token (Supports JWT payload decoding or raw base64 payload)
            var parts = req.IdToken.Split('.');
            if (parts.Length >= 2)
            {
                var payloadJson = System.Text.Encoding.UTF8.GetString(
                    Microsoft.IdentityModel.Tokens.Base64UrlEncoder.DecodeBytes(parts[1]));
                var doc = System.Text.Json.JsonDocument.Parse(payloadJson);
                var root = doc.RootElement;

                if (root.TryGetProperty("email", out var emailProp))
                    email = emailProp.GetString() ?? "";

                if (root.TryGetProperty("name", out var nameProp))
                    name = nameProp.GetString() ?? "";
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { error = "Unable to retrieve email from Google sign-in." });
            }

            email = email.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(name)) name = email.Split('@')[0];

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                user = new User
                {
                    Name         = name,
                    Email        = email,
                    Phone        = string.Empty,
                    Role         = "Customer",
                    IsActive     = true,
                    CreatedAt    = DateTime.UtcNow,
                    LastLoginAt  = DateTime.UtcNow
                };
                _db.Users.Add(user);
            }
            else
            {
                user.LastLoginAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            var token = _jwt.GenerateToken(user);
            return Ok(new AuthResponse(token, ToUserDto(user)));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Google authentication failed: " + ex.Message });
        }
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
        user.Email = string.IsNullOrWhiteSpace(req.Email) ? user.Email : req.Email.Trim().ToLowerInvariant();

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
        new(u.Id, u.Name, u.Phone, u.Email, u.Role, u.IsActive, u.CreatedAt, u.LastLoginAt);
}
