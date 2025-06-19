import React, { useState, useMemo } from 'react';
import InvoiceListHeader from './components/InvoiceListHeader';
import InvoiceListItem from './components/InvoiceListItem'; // Import the new component
import './InvoiceListPage.css'; // For specific styles

function InvoiceListPage({ invoices }) {
  const [filters, setFilters] = useState({
    draft: false,
    pending: false,
    paid: false,
  });

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.checked,
    });
  };

  // Filter invoices based on selected filters
  const filteredInvoices = useMemo(() => {
    const activeFilters = Object.keys(filters).filter(key => filters[key]);
    if (activeFilters.length === 0) {
      return invoices; // Show all if no filters selected
    }
    return invoices.filter(invoice => activeFilters.includes(invoice.status));
  }, [invoices, filters]);

  return (
    <div className="invoice-list-page">
      <InvoiceListHeader invoiceCount={filteredInvoices.length} filters={filters} onFilterChange={handleFilterChange} />
      <div className="invoice-list-container">
        {filteredInvoices.length === 0 ? (
          <div className="no-invoices-message">
            {/* Add illustration/message like in invoice-tediko later */}
            <h2>There is nothing here</h2>
            <p>Create an invoice by clicking the <strong>New Invoice</strong> button and get started</p>
          </div>
        ) : (
          filteredInvoices.map(invoice => <InvoiceListItem key={invoice.id} invoice={invoice} />)
        )}
      </div>
    </div>
  );
}

export default InvoiceListPage;