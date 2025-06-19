import './InvoiceInfo.css'; // For specific styles

function InvoiceInfo({ isNew, formData, handleChange }) {
  if (isNew) {
    return (
      <section className="invoice-info form-section"> {/* Keep .form-section for consistent styling */}
        <div className="form-grid form-grid-col-2"> {/* Use 2-column grid for Date and Terms */}
          <div>
            <label htmlFor="invoiceDate">Invoice Date</label>
            <input type="date" id="invoiceDate" name="invoiceDate" value={formData.invoiceDate || ''} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="paymentTerms">Payment Terms</label>
            <select id="paymentTerms" name="paymentTerms" value={formData.paymentTerms || '30'} onChange={handleChange}>
              <option value="1">Net 1 Day</option>
              <option value="7">Net 7 Days</option>
              <option value="14">Net 14 Days</option>
              <option value="30">Net 30 Days</option>
            </select>
          </div>
        </div>
        <div className="form-grid form-grid-col-1"> {/* Project Description on its own line */}
          <div>
            <label htmlFor="projectDescription">Project Description</label>
            <input type="text" id="projectDescription" name="projectDescription" value={formData.projectDescription || ''} onChange={handleChange} placeholder="e.g. Graphic Design Service"/>
          </div>
        </div>
      </section>
    );
  }

  // Display mode
  return (
    <section className="invoice-info-view">
      <div className="invoice-meta-grid">
        <div className="dates-column"> {/* New wrapper for first column */}
          <div className="invoice-date-group">
            <p className="meta-label">Invoice Date</p>
            <p className="meta-value">{formData.invoiceDate || 'YYYY-MM-DD'}</p>
          </div>
          <div className="payment-due-group">
            <p className="meta-label">Payment Due</p>
            <p className="meta-value">{formData.paymentDueDate || 'YYYY-MM-DD'}</p>
          </div>
          </div>
        
        <div className="bill-to-group"> {/* Second column */}
          <p className="meta-label">Bill To</p>
          <p className="meta-value client-name">{formData.clientName || 'Client Name'}</p>
          <address className="client-address">
            {formData.clientStreet || 'Street Address'}<br/>
            {formData.clientCity || 'City'}, {formData.clientPostCode || 'Post Code'}<br/>
            {formData.clientCountry || 'Country'}
         {/* Display client phone if available */}
            {formData.clientPhone && <><br/>{formData.clientPhone}</>}
          </address>
        </div>
          {formData.clientEmail && (
         <div className="client-email-group"> {/* Third column */}
             <p className="meta-label">Sent to</p>
             <p className="meta-value">{formData.clientEmail}</p>
           </div>
        )}
      </div>
    </section>
  );
}

export default InvoiceInfo;