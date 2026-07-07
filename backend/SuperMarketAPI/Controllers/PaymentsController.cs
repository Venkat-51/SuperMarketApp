using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Services;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly RazorpayService _razorpay;

    public PaymentsController(RazorpayService razorpay) => _razorpay = razorpay;

    /// <summary>POST /api/payments/create-order — Create a Razorpay order (server-side)</summary>
    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateRazorpayOrderRequest req)
    {
        if (req.Amount <= 0)
            return BadRequest(new { error = "Amount must be greater than 0." });

        var (orderId, success, error) = await _razorpay.CreateOrderAsync(req.Amount, req.Currency ?? "INR");
        if (!success)
            return StatusCode(500, new { error });

        return Ok(new RazorpayOrderResponse(orderId, req.Amount, req.Currency ?? "INR", _razorpay.KeyId));
    }

    /// <summary>POST /api/payments/verify — Verify Razorpay signature</summary>
    [HttpPost("verify")]
    public IActionResult VerifyPayment([FromBody] VerifyPaymentRequest req)
    {
        var isValid = _razorpay.VerifySignature(
            req.RazorpayOrderId,
            req.RazorpayPaymentId,
            req.RazorpaySignature);

        if (!isValid)
            return BadRequest(new { error = "Payment signature verification failed." });

        return Ok(new { message = "Payment verified.", paymentId = req.RazorpayPaymentId });
    }
}
