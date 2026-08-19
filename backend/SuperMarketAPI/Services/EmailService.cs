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

    private (string Host, int Port, string FromAddress, string FromName, string Password, string? OwnerEmail) GetSmtpConfig()
    {
        // Check environment variables first (e.g. BREVO_API_KEY / SMTP_*), fallback to appsettings.json
        var brevoApiKey = _config["BREVO_API_KEY"] ?? Environment.GetEnvironmentVariable("BREVO_API_KEY");
        var senderEmail = _config["SENDER_EMAIL"] ?? Environment.GetEnvironmentVariable("SENDER_EMAIL");
        var senderName  = _config["SENDER_NAME"]  ?? Environment.GetEnvironmentVariable("SENDER_NAME");

        var smtpHost    = _config["SMTP_HOST"]     ?? Environment.GetEnvironmentVariable("SMTP_HOST")
                          ?? _config["Email:SmtpHost"] ?? "smtp-relay.brevo.com";

        var smtpPortStr = _config["SMTP_PORT"]     ?? Environment.GetEnvironmentVariable("SMTP_PORT")
                          ?? _config["Email:SmtpPort"] ?? "587";
        var smtpPort    = int.TryParse(smtpPortStr, out var p) ? p : 587;

        var fromEmail   = !string.IsNullOrWhiteSpace(senderEmail) ? senderEmail
                          : (_config["Email:FromAddress"] ?? _config["SMTP_USER"] ?? Environment.GetEnvironmentVariable("SMTP_USER") ?? "");

        var fromName    = !string.IsNullOrWhiteSpace(senderName) ? senderName
                          : (_config["Email:FromName"] ?? "SuperMarketApp");

        // Prefer Brevo API Key if provided for Brevo SMTP relay, otherwise fallback to SMTP_PASSWORD / AppPassword
        var rawPassword = !string.IsNullOrWhiteSpace(brevoApiKey) ? brevoApiKey
                          : (_config["SMTP_PASSWORD"] ?? Environment.GetEnvironmentVariable("SMTP_PASSWORD")
                          ?? _config["Email:AppPassword"] ?? "");

        var password    = rawPassword.Replace(" ", "").Trim();

        var ownerEmail  = _config["Email:OwnerAddress"] ?? Environment.GetEnvironmentVariable("OWNER_EMAIL") ?? fromEmail;

        if (string.IsNullOrWhiteSpace(fromEmail))
            throw new InvalidOperationException("Sender email address is not configured.");

        if (string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("SMTP password / Brevo API Key is not configured.");

        return (smtpHost, smtpPort, fromEmail, fromName, password, ownerEmail);
    }

    public async Task SendOtpAsync(string toEmail, string otp)
    {
        var (smtpHost, smtpPort, fromEmail, fromName, password, _) = GetSmtpConfig();

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
        await client.AuthenticateAsync(fromEmail, password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("OTP email sent to {Email} via {Host}", toEmail, smtpHost);
    }

    public async Task SendOrderInvoiceEmailAsync(string toEmail, string subject, string bodyHtml, byte[] pdfBytes, string attachmentFilename)
    {
        var (smtpHost, smtpPort, fromEmail, fromName, password, ownerEmail) = GetSmtpConfig();

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(fromEmail, password);

        // 1. Send dedicated Customer email
        if (!string.IsNullOrWhiteSpace(toEmail) && MailboxAddress.TryParse(toEmail.Trim(), out var custAddr))
        {
            var custMsg = new MimeMessage();
            custMsg.From.Add(new MailboxAddress(fromName, fromEmail));
            custMsg.To.Add(custAddr);
            custMsg.Subject = subject;

            var custBuilder = new BodyBuilder { HtmlBody = bodyHtml };
            if (pdfBytes != null && pdfBytes.Length > 0)
            {
                custBuilder.Attachments.Add(attachmentFilename, pdfBytes, ContentType.Parse("application/pdf"));
            }
            custMsg.Body = custBuilder.ToMessageBody();

            try
            {
                await client.SendAsync(custMsg);
                _logger.LogInformation("Customer Invoice PDF email sent to {CustomerEmail}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send customer email to {CustomerEmail}", toEmail);
            }
        }

        // 2. Send dedicated Store Owner Alert email
        if (!string.IsNullOrWhiteSpace(ownerEmail) && MailboxAddress.TryParse(ownerEmail.Trim(), out var ownerAddr))
        {
            var ownerMsg = new MimeMessage();
            ownerMsg.From.Add(new MailboxAddress($"{fromName} Store System", fromEmail));
            ownerMsg.To.Add(ownerAddr);
            ownerMsg.Subject = $"[NEW ORDER ALERT] #{subject.Replace("Order Confirmed! ", "")}";

            var ownerHtml = $"""
                <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #FF9933; border-radius: 12px; background-color: #fffbf7;">
                  <h2 style="color: #d97706; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                    🛒 New Order Received!
                  </h2>
                  <p>Store Owner Alert: A new order has been successfully placed on <strong>Super Market App</strong>.</p>
                  
                  <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #fed7aa; margin: 16px 0;">
                    {bodyHtml}
                  </div>

                  <p style="font-size: 13px; color: #4b5563;">
                    📌 The official customer PDF invoice is attached to this email for your records and fulfillment dispatch.
                  </p>
                </div>
            """;

            var ownerBuilder = new BodyBuilder { HtmlBody = ownerHtml };
            if (pdfBytes != null && pdfBytes.Length > 0)
            {
                ownerBuilder.Attachments.Add(attachmentFilename, pdfBytes, ContentType.Parse("application/pdf"));
            }
            ownerMsg.Body = ownerBuilder.ToMessageBody();

            try
            {
                await client.SendAsync(ownerMsg);
                _logger.LogInformation("Store Owner Alert email sent to {OwnerEmail}", ownerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send owner notification email to {OwnerEmail}", ownerEmail);
            }
        }

        await client.DisconnectAsync(true);
    }

}

