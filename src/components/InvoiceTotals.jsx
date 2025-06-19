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

  if (isTableView) {
    // Render Subtotal, Tax (if applicable), and Grand Total as table rows
    return (
      <>
        <tr>
          <td colSpan="2"></td> {/* Empty cells for alignment */}
          <td className="summary-label">Subtotal</td>
          <td className="summary-value">&pound;{subtotal.toFixed(2)}</td>
        </tr>
        {currentTaxRate > 0 && (
          <tr>
            <td colSpan="2"></td>
            <td className="summary-label">Tax ({ (currentTaxRate * 100).toFixed(0) }%)</td>
            <td className="summary-value">&pound;{taxAmount.toFixed(2)}</td>
          </tr>
        )}
        <tr className="grand-total-row"> {/* Added class for specific styling if needed */}
          <td colSpan="2"></td>
          <td className="grand-total-label">Grand Total</td>
          <td className="grand-total-value">&pound;{total.toFixed(2)}</td>
        </tr>
      </>
    );
  }

  return (
    <section className="invoice-totals">
      <p><strong>Subtotal:</strong> &pound;{subtotal.toFixed(2)}</p>
      {currentTaxRate > 0 && <p><strong>Tax ({ (currentTaxRate * 100).toFixed(0) }%):</strong> &pound;{taxAmount.toFixed(2)}</p>}
      <p><strong>Total:</strong> &pound;{total.toFixed(2)}</p>
    </section>
  );

}

export default InvoiceTotals;