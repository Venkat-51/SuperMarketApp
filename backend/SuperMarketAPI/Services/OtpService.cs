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
    private readonly ILogger<OtpService> _logger;

    public OtpService(EmailService email, ILogger<OtpService> logger)
    {
        _email  = email;
        _logger = logger;
    }

    /// <summary>Generates a 6-digit OTP, stores it and sends it to the given email.</summary>
    public async Task GenerateAndSendAsync(string emailAddress)
    {
        var otp = Random.Shared.Next(0, 1_000_000).ToString("D6");
        lock (_lock)
        {
            _store[emailAddress.ToLowerInvariant()] = (otp, DateTime.UtcNow.AddMinutes(10));
        }

        _logger.LogInformation("==========================================");
        _logger.LogInformation("GENERATED OTP FOR {Email}: {Otp}", emailAddress, otp);
        _logger.LogInformation("==========================================");

        try
        {
            await _email.SendOtpAsync(emailAddress, otp);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Email delivery failed for {Email}: {Error}. Use logged OTP {Otp}", emailAddress, ex.Message, otp);
        }
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
