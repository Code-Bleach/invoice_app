import React from 'react';
import InvoiceListHeader from './components/InvoiceListHeader';
import InvoiceListItem from './components/InvoiceListItem'; // Import the new component
import './InvoiceListPage.css'; // For specific styles

function InvoiceListPage({ invoices, activeFilters, setActiveFilters }) {


  const handleFilterChange = (event) => {
    const { name, checked } = event.target;
    // Update the state in App.jsx
    setActiveFilters(prevFilters => {
      if (checked) {
        return [...prevFilters, name]; // Add filter
      } else {
        return prevFilters.filter(f => f !== name); // Remove filter
      }
    });
  };

  //The 'invoices' prop is already filtered by the backend.

  return (
    <div className="invoice-list-page">
      <InvoiceListHeader 
        invoiceCount={invoices.length} 
        activeFilters={activeFilters} 
        onFilterChange={handleFilterChange} 
      />
      <div className="invoice-list-container">
        {invoices.length === 0 ? (
            <div className="no-invoices-message">
            {/* Add illustration/message like in invoice-tediko later */}
            <h2>There is nothing here</h2>
            <p>Create an invoice by clicking the <strong>New Invoice</strong> button and get started</p>
          </div>
        ) : (
          invoices.map(invoice => <InvoiceListItem key={invoice.id} invoice={invoice} />)
        )}
      </div>
    </div>
  );
}

export default InvoiceListPage;