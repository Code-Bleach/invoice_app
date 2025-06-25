import './InvoiceTotals.css';

function InvoiceTotals({ items, serviceCharge = 0, taxRate = 0, isTableView = false }) { // Added isTableView
  // Calculate subtotal from items
  const itemsSubtotal = items.reduce((acc, item) => {
    const itemTotal = (item.quantity || 0) * (item.price || 0);
    return acc + itemTotal;
  }, 0);

  const currentServiceCharge = Number(serviceCharge) || 0;
  const subtotal = itemsSubtotal + currentServiceCharge;

  const currentTaxRate = Number(taxRate) || 0; // Ensure taxRate is a number
  const taxAmount = subtotal * currentTaxRate;
  const total = subtotal + taxAmount;

  // Helper to format numbers with commas and two decimal places
  const formatNumberWithCommas = (num) => {
    // Using 'en-GB' locale for UK-style formatting (e.g., 1,234.56)
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (isTableView) {
    // Render Subtotal, Tax (if applicable), and Grand Total as table rows
    return (
      <>
        <tr>
          <td colSpan="2"></td> {/* Empty cells for alignment */}
          <td className="summary-label">Subtotal</td>
          <td className="summary-value">&pound;{formatNumberWithCommas(subtotal)}</td>
        </tr>
        {currentTaxRate > 0 && (
          <tr>
            <td colSpan="2"></td>
            <td className="summary-label">Tax ({ (currentTaxRate * 100).toFixed(0) }%)</td>
            <td className="summary-value">&pound;{formatNumberWithCommas(taxAmount)}</td>
          </tr>
        )}
        <tr className="grand-total-row"> {/* Added class for specific styling if needed */}
          <td colSpan="2"></td>
          <td className="grand-total-label">Grand Total</td>
          <td className="grand-total-value">&pound;{formatNumberWithCommas(total)}</td>
        </tr>
      </>
    );
  }

  return (
    <section className="invoice-totals">
      <p><strong>Subtotal:</strong> &pound;{formatNumberWithCommas(subtotal)}</p>
      {currentTaxRate > 0 && <p><strong>Tax ({ (currentTaxRate * 100).toFixed(0) }%):</strong> &pound;{formatNumberWithCommas(taxAmount)}</p>}
      <p><strong>Total:</strong> &pound;{formatNumberWithCommas(total)}</p>
    </section>
  );

}

export default InvoiceTotals;