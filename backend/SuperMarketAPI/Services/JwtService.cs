using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Services;

public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    private string GetSecretKey()
    {
        var rawKey = _config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(rawKey)) rawKey = _config["JWT_KEY"];
        if (string.IsNullOrWhiteSpace(rawKey)) rawKey = Environment.GetEnvironmentVariable("JWT_KEY");
        if (string.IsNullOrWhiteSpace(rawKey))
        {
            throw new InvalidOperationException("JWT_KEY is missing from configuration or environment. Please configure JWT_KEY in environment variables or appsettings.json.");
        }
        return rawKey;
    }

    public string GenerateToken(User user)
    {
        var rawKey = GetSecretKey();
        var key    = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(rawKey));
        var creds  = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:ExpiryHours"] ?? "24"));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name,  user.Name),
            new Claim("phone",                        user.Phone),
            new Claim(ClaimTypes.Role,               user.Role ?? "Customer"),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             _config["Jwt:Issuer"],
            audience:           _config["Jwt:Audience"],
            claims:             claims,
            expires:            expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public int? ValidateTokenAndGetUserId(string token)
    {
        try
        {
            var rawKey = GetSecretKey();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(rawKey));
            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = key,
                ValidateIssuer           = true,
                ValidIssuer              = _config["Jwt:Issuer"],
                ValidateAudience         = true,
                ValidAudience            = _config["Jwt:Audience"],
                ValidateLifetime         = true,
                ClockSkew                = TimeSpan.Zero,
            }, out _);

            var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)
                       ?? principal.FindFirst(JwtRegisteredClaimNames.Sub);

            return idClaim is not null && int.TryParse(idClaim.Value, out var id) ? id : null;
        }
        catch
        {
            return null;
        }
    }
}
