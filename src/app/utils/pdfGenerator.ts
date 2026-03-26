import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from './storageUtils';
import { formatIndianCurrency } from './currencyUtils';

export function generateInvoicePDF(transaction: Transaction, customerPhone: string): void {
  try {
    // Validate inputs
    if (!transaction || !transaction.items || transaction.items.length === 0) {
      throw new Error('Invalid transaction: No items found');
    }
    if (!transaction.invoiceNumber) {
      throw new Error('Invalid transaction: Missing invoice number');
    }
    if (!customerPhone) {
      throw new Error('Invalid customer: Missing phone number');
    }

    const doc = new jsPDF();

    // Set colors
    const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
    const secondaryColor: [number, number, number] = [100, 116, 139]; // Gray

    // Header with gradient effect (simulated with rectangles)
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Smart AI Checkout', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Futuristic Retail Solutions', 105, 30, { align: 'center' });

    // Invoice title
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(18);
    doc.text('INVOICE', 105, 55, { align: 'center' });

    // Invoice details box
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.rect(15, 65, 180, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Left column
    doc.text(`Invoice No: ${transaction.invoiceNumber}`, 20, 73);
    doc.text(`Date: ${new Date(transaction.timestamp).toLocaleDateString('en-IN')}`, 20, 80);
    doc.text(`Time: ${new Date(transaction.timestamp).toLocaleTimeString('en-IN')}`, 20, 87);

    // Right column
    doc.text(`Customer ID: ${transaction.customerId}`, 120, 73);
    doc.text(`Name: ${transaction.customerName}`, 120, 80);
    doc.text(`Phone: ${customerPhone}`, 120, 87);

    // Items table
    const tableData = transaction.items.map(item => [
      item.product.name,
      item.quantity.toString(),
      formatIndianCurrency(item.product.price),
      formatIndianCurrency(item.product.price * item.quantity)
    ]);

    autoTable(doc, {
      startY: 105,
      head: [['Product Name', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      }
    });

    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Summary box
    doc.setFillColor(249, 250, 251);
    doc.rect(120, finalY, 75, 35, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.rect(120, finalY, 75, 35);

    doc.setFontSize(10);
    doc.text('Subtotal:', 125, finalY + 8);
    doc.text(formatIndianCurrency(transaction.subtotal), 190, finalY + 8, { align: 'right' });

    doc.text('Loyalty Discount:', 125, finalY + 16);
    doc.setTextColor(220, 38, 38); // Red for discount
    doc.text(`-${formatIndianCurrency(transaction.loyaltyDiscount)}`, 190, finalY + 16, { align: 'right' });

    // Total line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(125, finalY + 20, 190, finalY + 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Grand Total:', 125, finalY + 28);
    doc.text(formatIndianCurrency(transaction.total), 190, finalY + 28, { align: 'right' });

    // Payment method
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Payment Method: ${transaction.paymentMethod}`, 15, finalY + 28);

    // Footer
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.3);
    doc.line(15, 270, 195, 270);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Thank you for shopping with us!', 105, 277, { align: 'center' });
    doc.text('Powered by Smart AI Checkout System', 105, 283, { align: 'center' });

    // Save PDF
    doc.save(`Invoice_${transaction.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    // Notify user about the error
    if (typeof window !== 'undefined' && (window as any).notify) {
      (window as any).notify.error('Failed to generate PDF invoice');
    }
    throw error; // Re-throw so calling code knows it failed
  }
}
