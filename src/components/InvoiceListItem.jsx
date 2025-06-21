import React from 'react';
import { Link } from 'react-router-dom';
import './InvoiceListItem.css'; // We'll create this next

function InvoiceListItem({ invoice }) {
  // Calculate due date (similar logic to InvoiceInfo, can be refactored later)
  let dueDate = 'N/A';
  if (invoice.invoiceDate && invoice.paymentTerms) {
    const date = new Date(invoice.invoiceDate);
    date.setDate(date.getDate() + parseInt(invoice.paymentTerms, 10));
    dueDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const totalAmount = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(invoice.serviceCharge) || 0);

  return (
    <Link to={`/invoice/${invoice.id}`} className="invoice-list-item-link">
      <div className={`invoice-list-item status-${invoice.status}`}>
        <span className="invoice-id">#{invoice.id.substring(0, 13)}</span> {/* Shortened ID */}
        <span className="due-date">Due {dueDate}</span>
        <span className="client-name">{invoice.clientName || 'N/A'}</span>
        <span className="total-amount">&pound;{totalAmount.toFixed(2)}</span>
        <div className={`status-badge status-${invoice.status}`}>
          <span className="status-dot"></span>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </div>
        <span className="arrow-icon">&gt;</span> {/* Simple arrow */}
      </div>
    </Link>
  );
}

export default InvoiceListItem;