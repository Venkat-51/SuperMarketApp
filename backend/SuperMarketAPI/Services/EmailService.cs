using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace SuperMarketAPI.Services;

/// <summary>
/// Sends OTP emails via Gmail SMTP (free, no third-party service needed).
/// Requires a Gmail account with an App Password configured.
/// </summary>
public class EmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOtpAsync(string toEmail, string otp)
    {
        var smtpHost    = _config["Email:SmtpHost"]    ?? "smtp.gmail.com";
        var smtpPort    = int.Parse(_config["Email:SmtpPort"] ?? "587");
        var fromEmail   = _config["Email:FromAddress"] ?? throw new InvalidOperationException("Email:FromAddress not configured.");
        var fromName    = _config["Email:FromName"]    ?? "Super Market App";
        var appPassword = _config["Email:AppPassword"] ?? throw new InvalidOperationException("Email:AppPassword not configured.");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = $"{otp} is your Super Market App OTP";

        message.Body = new TextPart("html")
        {
            Text = $"""
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
                  <h2 style="color:#FF9933;margin-bottom:8px;">Super Market App</h2>
                  <p style="color:#555;">Your one-time password (OTP) is:</p>
                  <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#222;margin:24px 0;text-align:center;">
                    {otp}
                  </div>
                  <p style="color:#888;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
                  <p style="color:#bbb;font-size:11px;">If you did not request this OTP, please ignore this email.</p>
                </div>
            """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(fromEmail, appPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("OTP email sent to {Email}", toEmail);
    }
}
