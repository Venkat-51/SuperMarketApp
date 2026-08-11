import jsPDF from 'jspdf';

export interface InvoiceData {
  orderId: string | number;
  date: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: {
    label?: string;
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  paymentMethod: string;
  paymentId?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  itemSubtotal: number;
  deliveryFee: number;
  total: number;
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [249, 115, 22]; // SuperMarket Orange (#f97316)
  const textColor = [31, 41, 55]; // Dark Gray
  const lightGray = [243, 244, 246];

  // Header Banner
  doc.setFillColor(255, 247, 237);
  doc.rect(0, 0, 210, 38, 'F');

  // Brand Name
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SUPERMARKET APP', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Fresh Groceries Delivered Fast & Local', 14, 25);

  // INVOICE title on top right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INVOICE', 196, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Invoice #: INV-${data.orderId}`, 196, 25, { align: 'right' });
  doc.text(`Date: ${data.date}`, 196, 30, { align: 'right' });

  // Divider Line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // Customer & Shipping Info Box
  let startY = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('BILLED TO / DELIVERED TO:', 14, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  let currentY = startY + 6;
  if (data.customerName) {
    doc.setFont('helvetica', 'bold');
    doc.text(data.customerName, 14, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 5;
  }
  if (data.customerPhone) {
    doc.text(`Phone: ${data.customerPhone}`, 14, currentY);
    currentY += 5;
  }
  if (data.customerEmail) {
    doc.text(`Email: ${data.customerEmail}`, 14, currentY);
    currentY += 5;
  }
  if (data.address) {
    if (data.address.label) doc.text(`[${data.address.label}]`, 14, currentY), (currentY += 5);
    if (data.address.line1) doc.text(data.address.line1, 14, currentY), (currentY += 5);
    const cityStatePin = [data.address.city, data.address.state, data.address.pincode].filter(Boolean).join(', ');
    if (cityStatePin) doc.text(cityStatePin, 14, currentY), (currentY += 5);
  } else {
    doc.text('Standard Delivery Address', 14, currentY);
    currentY += 5;
  }

  // Payment Info Block (Right Side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('PAYMENT INFORMATION:', 120, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  const paymentMethodText = (data.paymentMethod || 'Cash on Delivery').toUpperCase();
  doc.text(`Payment Method: ${paymentMethodText}`, 120, startY + 6);
  if (data.paymentId) {
    doc.text(`Payment Ref ID: ${data.paymentId}`, 120, startY + 11);
  }
  doc.text(`Payment Status: PAID`, 120, startY + (data.paymentId ? 16 : 11));

  // Table Setup
  const tableStartY = Math.max(currentY, startY + 24) + 6;

  // Table Header Background
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(14, tableStartY, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  doc.text('ITEM DESCRIPTION', 18, tableStartY + 5.5);
  doc.text('QTY', 125, tableStartY + 5.5, { align: 'center' });
  doc.text('PRICE', 155, tableStartY + 5.5, { align: 'right' });
  doc.text('TOTAL', 190, tableStartY + 5.5, { align: 'right' });

  // Table Rows
  let rowY = tableStartY + 13;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);

  const safeItems = Array.isArray(data.items) && data.items.length > 0
    ? data.items
    : [{ name: 'SuperMarket Grocery Order', quantity: 1, price: data.total || 0 }];

  safeItems.forEach((item, index) => {
    // Alternate light background for clarity
    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(14, rowY - 5, 182, 7, 'F');
    }

    const price = typeof item.price === 'number' ? item.price : 0;
    const qty = typeof item.quantity === 'number' ? item.quantity : 1;
    const itemTotal = price * qty;
    const itemName = item.name || 'Grocery Item';

    doc.text(itemName.length > 50 ? itemName.substring(0, 48) + '...' : itemName, 18, rowY);
    doc.text(qty.toString(), 125, rowY, { align: 'center' });
    doc.text(`Rs. ${price.toFixed(2)}`, 155, rowY, { align: 'right' });
    doc.text(`Rs. ${itemTotal.toFixed(2)}`, 190, rowY, { align: 'right' });

    rowY += 8;
  });

  // Bottom Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(14, rowY, 196, rowY);
  rowY += 6;

  // Summary Calculations
  doc.setFontSize(9);

  const subtotalVal = typeof data.itemSubtotal === 'number' ? data.itemSubtotal : safeItems.reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0);
  const deliveryVal = typeof data.deliveryFee === 'number' ? data.deliveryFee : 0;
  const totalVal = typeof data.total === 'number' && data.total > 0 ? data.total : (subtotalVal + deliveryVal);

  doc.setFont('helvetica', 'normal');
  doc.text('Items Subtotal:', 140, rowY);
  doc.text(`Rs. ${subtotalVal.toFixed(2)}`, 190, rowY, { align: 'right' });
  rowY += 6;

  doc.text('Delivery Fee:', 140, rowY);
  doc.text(`Rs. ${deliveryVal.toFixed(2)}`, 190, rowY, { align: 'right' });
  rowY += 8;

  // Total Line
  doc.setFillColor(255, 247, 237);
  doc.rect(135, rowY - 5, 61, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Grand Total:', 140, rowY + 1.5);
  doc.text(`Rs. ${totalVal.toFixed(2)}`, 190, rowY + 1.5, { align: 'right' });

  // Footer Note
  const footerY = 275;
  doc.setDrawColor(243, 244, 246);
  doc.line(14, footerY - 5, 196, footerY - 5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for shopping with SuperMarket App! For support or queries, contact support@supermarketapp.com', 105, footerY, { align: 'center' });

  // Download PDF
  doc.save(`Invoice_Order_${data.orderId}.pdf`);
}
