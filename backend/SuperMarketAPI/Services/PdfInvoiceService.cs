using System.Globalization;
using System.Text;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Services;

public class PdfInvoiceService
{
    public byte[] GenerateInvoicePdf(Order order, User customer)
    {
        var customerName = string.IsNullOrWhiteSpace(customer.Name) ? "Valued Customer" : customer.Name;
        var customerEmail = customer.Email ?? "N/A";
        var customerPhone = customer.Phone ?? "N/A";

        var addressStr = order.Address != null
            ? $"{order.Address.Line1}, {order.Address.City}, {order.Address.State} - {order.Address.Pincode}"
            : "Standard Delivery Address";

        var dateStr = order.CreatedAt.ToString("dd MMM yyyy");
        var paymentMethodStr = order.PaymentMethod.ToString().ToUpper();
        var paymentRefStr = string.IsNullOrWhiteSpace(order.PaymentId) ? "N/A" : order.PaymentId;

        decimal subtotal = 0;
        foreach (var item in order.Items)
        {
            subtotal += item.Price * item.Quantity;
        }

        var isPaid = order.PaymentMethod != PaymentMethod.COD || !string.IsNullOrWhiteSpace(order.PaymentId);
        var paymentStatusStr = isPaid ? "PAID (SUCCESS)" : "PAY ON ARRIVAL";

        // Generate clean PDF page matching the frontend layout visually with PDF vector graphics
        var sb = new StringBuilder();
        sb.AppendLine("BT");
        
        // Header Banner Box (Light Orange Fill)
        // Draw Header Text
        sb.AppendLine("/F2 20 Tf 0.97 0.45 0.08 rg 40 800 Td (SUPERMARKET APP) Tj ET");
        sb.AppendLine("BT /F1 9 Tf 0.39 0.45 0.54 rg 40 785 Td (Fresh Groceries Delivered Fast & Local) Tj ET");
        
        sb.AppendLine($"BT /F2 18 Tf 0.97 0.45 0.08 rg 440 800 Td (INVOICE) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.39 0.45 0.54 rg 420 785 Td (Invoice #: INV-{order.Id}) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.39 0.45 0.54 rg 420 772 Td (Date: {dateStr}) Tj ET");

        // Billed To Section
        sb.AppendLine("BT /F2 10 Tf 0.12 0.16 0.21 rg 40 735 Td (BILLED TO / DELIVERED TO:) Tj ET");
        sb.AppendLine($"BT /F2 9 Tf 0.12 0.16 0.21 rg 40 720 Td ({EscapePdf(customerName)}) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 40 707 Td (Phone: {EscapePdf(customerPhone)}) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 40 694 Td (Email: {EscapePdf(customerEmail)}) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 40 681 Td (Address: {EscapePdf(addressStr)}) Tj ET");

        // Payment Info Block (Right Side)
        sb.AppendLine("BT /F2 10 Tf 0.12 0.16 0.21 rg 340 735 Td (PAYMENT INFORMATION:) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 340 720 Td (Payment Method: {paymentMethodStr}) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 340 707 Td (Payment Ref ID: {EscapePdf(paymentRefStr)}) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 340 694 Td (Payment Status: {paymentStatusStr}) Tj ET");

        // Table Header
        sb.AppendLine("BT /F2 9 Tf 0.12 0.16 0.21 rg 40 640 Td (ITEM DESCRIPTION) Tj ET");
        sb.AppendLine("BT /F2 9 Tf 0.12 0.16 0.21 rg 250 640 Td (PACK WEIGHT / SIZE) Tj ET");
        sb.AppendLine("BT /F2 9 Tf 0.12 0.16 0.21 rg 380 640 Td (QTY) Tj ET");
        sb.AppendLine("BT /F2 9 Tf 0.12 0.16 0.21 rg 430 640 Td (PRICE) Tj ET");
        sb.AppendLine("BT /F2 9 Tf 0.12 0.16 0.21 rg 500 640 Td (TOTAL) Tj ET");

        int currentY = 620;
        foreach (var item in order.Items)
        {
            var name = item.ProductName.Length > 28 ? item.ProductName.Substring(0, 25) + "..." : item.ProductName;
            var weightStr = string.IsNullOrWhiteSpace(item.Weight) ? "1 unit" : item.Weight;
            if (weightStr.Length > 20) weightStr = weightStr.Substring(0, 18) + "..";
            var lineTotal = item.Price * item.Quantity;

            sb.AppendLine($"BT /F1 9 Tf 0.22 0.25 0.31 rg 40 {currentY} Td ({EscapePdf(name)}) Tj ET");
            sb.AppendLine($"BT /F1 9 Tf 0.22 0.25 0.31 rg 250 {currentY} Td ({EscapePdf(weightStr)}) Tj ET");
            sb.AppendLine($"BT /F1 9 Tf 0.22 0.25 0.31 rg 385 {currentY} Td ({item.Quantity}) Tj ET");
            sb.AppendLine($"BT /F1 9 Tf 0.22 0.25 0.31 rg 430 {currentY} Td (Rs. {item.Price:F2}) Tj ET");
            sb.AppendLine($"BT /F1 9 Tf 0.22 0.25 0.31 rg 500 {currentY} Td (Rs. {lineTotal:F2}) Tj ET");

            currentY -= 18;
        }

        // Totals Summary
        currentY -= 10;
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 380 {currentY} Td (Items Subtotal:) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 490 {currentY} Td (Rs. {subtotal:F2}) Tj ET");

        currentY -= 16;
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 380 {currentY} Td (Delivery Fee:) Tj ET");
        sb.AppendLine($"BT /F1 9 Tf 0.29 0.33 0.38 rg 490 {currentY} Td (Rs. {order.DeliveryFee:F2}) Tj ET");

        currentY -= 20;
        sb.AppendLine($"BT /F2 11 Tf 0.97 0.45 0.08 rg 380 {currentY} Td (Grand Total:) Tj ET");
        sb.AppendLine($"BT /F2 11 Tf 0.97 0.45 0.08 rg 490 {currentY} Td (Rs. {order.Total:F2}) Tj ET");

        // Footer Note
        sb.AppendLine("BT /F1 8 Tf 0.61 0.64 0.69 rg 70 40 Td (Thank you for shopping with SuperMarket App! For queries, contact support@supermarketapp.com) Tj ET");

        var streamBytes = Encoding.ASCII.GetBytes(sb.ToString());

        var objects = new List<string>();
        // 1: Catalog
        objects.Add("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
        // 2: Pages
        objects.Add("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
        // 3: Page
        objects.Add("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj");
        // 4: Regular Font (Helvetica)
        objects.Add("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
        // 5: Bold Font (Helvetica-Bold)
        objects.Add("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");
        // 6: Contents Stream
        objects.Add($"6 0 obj\n<< /Length {streamBytes.Length} >>\nstream\n{sb.ToString()}endstream\nendobj");

        var pdfBuilder = new StringBuilder();
        pdfBuilder.AppendLine("%PDF-1.4");
        pdfBuilder.AppendLine("%âãÏÓ");

        var offsets = new List<long>();
        long currentOffset = Encoding.ASCII.GetBytes(pdfBuilder.ToString()).Length;

        foreach (var obj in objects)
        {
            offsets.Add(currentOffset);
            pdfBuilder.AppendLine(obj);
            currentOffset = Encoding.ASCII.GetBytes(pdfBuilder.ToString()).Length;
        }

        long xrefOffset = currentOffset;
        pdfBuilder.AppendLine("xref");
        pdfBuilder.AppendLine($"0 {objects.Count + 1}");
        pdfBuilder.AppendLine("0000000000 65535 f ");
        foreach (var off in offsets)
        {
            pdfBuilder.AppendLine($"{off:D10} 00000 n ");
        }

        pdfBuilder.AppendLine("trailer");
        pdfBuilder.AppendLine($"<< /Size {objects.Count + 1} /Root 1 0 R >>");
        pdfBuilder.AppendLine("startxref");
        pdfBuilder.AppendLine(xrefOffset.ToString());
        pdfBuilder.AppendLine("%%EOF");

        return Encoding.ASCII.GetBytes(pdfBuilder.ToString());
    }

    private static string EscapePdf(string str)
    {
        if (string.IsNullOrEmpty(str)) return "";
        return str.Replace("\\", "\\\\")
                  .Replace("(", "\\(")
                  .Replace(")", "\\)")
                  .Replace("₹", "Rs. ");
    }
}
