namespace SuperMarketAPI.Services;

/// <summary>
/// Generates, stores and verifies 6-digit OTPs.
/// Sends the OTP to the user's email via EmailService.
/// </summary>
public class OtpService
{
    // In-memory store: identifier → (otp, expiry)
    private static readonly Dictionary<string, (string Otp, DateTime Expiry)> _store = new();
    private static readonly object _lock = new();

    private readonly EmailService _email;

    public OtpService(EmailService email)
    {
        _email = email;
    }

    /// <summary>Generates a 6-digit OTP, stores it and sends it to the given email.</summary>
    public async Task GenerateAndSendAsync(string emailAddress)
    {
        var otp = Random.Shared.Next(0, 1_000_000).ToString("D6");
        lock (_lock)
        {
            _store[emailAddress.ToLowerInvariant()] = (otp, DateTime.UtcNow.AddMinutes(10));
        }
        await _email.SendOtpAsync(emailAddress, otp);
    }

    /// <summary>Returns true if the OTP is valid and not expired, then removes it.</summary>
    public bool Verify(string emailAddress, string otp)
    {
        var key = emailAddress.ToLowerInvariant();
        lock (_lock)
        {
            if (!_store.TryGetValue(key, out var entry)) return false;
            if (entry.Expiry < DateTime.UtcNow)
            {
                _store.Remove(key);
                return false;
            }
            if (entry.Otp != otp) return false;
            _store.Remove(key);
            return true;
        }
    }
}
