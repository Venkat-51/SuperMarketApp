using System.Security.Cryptography;
using System.Text;

namespace SuperMarketAPI.Services;

public static class PasswordHasher
{
    public static string Hash(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    public static bool Verify(string password, string? hash)
    {
        if (string.IsNullOrEmpty(hash)) return false;
        return Hash(password) == hash;
    }
}
