namespace SuperMarketAPI.Services;

/// <summary>
/// Simulates OTP generation and verification.
/// In production, integrate with SMS providers like MSG91, Twilio, or AWS SNS.
/// </summary>
public class OtpService
{
    // In-memory store: phone → (otp, expiry)
    private static readonly Dictionary<string, (string Otp, DateTime Expiry)> _store = new();
    private static readonly object _lock = new();

    public string GenerateAndStore(string phone)
    {
        // For demo, OTP is always "123456" — replace with Random.Shared.Next(100000,999999).ToString()
        var otp = "123456";
        lock (_lock)
        {
            _store[phone] = (otp, DateTime.UtcNow.AddMinutes(10));
        }
        // TODO: send SMS via your provider here
        return otp;
    }

    public bool Verify(string phone, string otp)
    {
        lock (_lock)
        {
            if (!_store.TryGetValue(phone, out var entry)) return false;
            if (entry.Expiry < DateTime.UtcNow)
            {
                _store.Remove(phone);
                return false;
            }
            if (entry.Otp != otp) return false;
            _store.Remove(phone);
            return true;
        }
    }
}
