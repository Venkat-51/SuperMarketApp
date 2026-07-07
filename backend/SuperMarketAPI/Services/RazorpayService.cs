using System.Security.Cryptography;
using System.Text;

namespace SuperMarketAPI.Services;

public class RazorpayService
{
    private readonly string _keyId;
    private readonly string _keySecret;

    public RazorpayService(IConfiguration config)
    {
        _keyId     = config["Razorpay:KeyId"]     ?? string.Empty;
        _keySecret = config["Razorpay:KeySecret"] ?? string.Empty;
    }

    /// <summary>
    /// Creates a Razorpay order via the REST API.
    /// Returns the Razorpay order_id used to initialise checkout.js.
    /// </summary>
    public async Task<(string OrderId, bool Success, string? Error)> CreateOrderAsync(decimal amountInRupees, string currency = "INR")
    {
        if (string.IsNullOrEmpty(_keyId) || _keyId == "YOUR_RAZORPAY_KEY_ID")
        {
            // Demo mode — return a mock order id
            var mockId = "order_" + Guid.NewGuid().ToString("N")[..16].ToUpper();
            return (mockId, true, null);
        }

        try
        {
            using var client = new HttpClient();
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_keyId}:{_keySecret}"));
            client.DefaultRequestHeaders.Add("Authorization", $"Basic {credentials}");

            var payload = new
            {
                amount   = (long)(amountInRupees * 100),  // paise
                currency = currency,
                receipt  = "rcpt_" + Guid.NewGuid().ToString("N")[..8]
            };

            var response = await client.PostAsJsonAsync("https://api.razorpay.com/v1/orders", payload);
            if (!response.IsSuccessStatusCode)
                return (string.Empty, false, $"Razorpay API error: {response.StatusCode}");

            var data = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            var orderId = data?["id"]?.ToString() ?? string.Empty;
            return (orderId, true, null);
        }
        catch (Exception ex)
        {
            return (string.Empty, false, ex.Message);
        }
    }

    /// <summary>
    /// Verifies the HMAC-SHA256 signature from Razorpay webhook/callback.
    /// </summary>
    public bool VerifySignature(string razorpayOrderId, string razorpayPaymentId, string signature)
    {
        if (string.IsNullOrEmpty(_keySecret)) return true; // demo mode — skip

        var payload = $"{razorpayOrderId}|{razorpayPaymentId}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_keySecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var expected = BitConverter.ToString(hash).Replace("-", "").ToLower();
        return expected == signature.ToLower();
    }

    public string KeyId => _keyId;
}
