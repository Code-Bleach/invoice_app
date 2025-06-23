import { format, addDays } from 'date-fns';
import './InvoiceInfo.css'; // For specific styles

function InvoiceInfo({ isNew, formData, handleChange }) {
  // Helper to format dates correctly, avoiding timezone off-by-one errors.
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Example input: '2023-10-27T00:00:00.000Z'
    const datePart = dateString.substring(0, 10); // -> '2023-10-27'
    const [year, month, day] = datePart.split('-').map(Number);
    // new Date(year, month - 1, day) correctly creates a local date.
    // JavaScript's Date month is 0-indexed, so we subtract 1.
    const date = new Date(year, month - 1, day);
    return format(date, 'dd MMM yyyy');
  };

  /**
   * Calculates and formats the due date for display.
   * This ensures the displayed due date is always in sync with the invoice date and payment terms,
   * rather than relying on the potentially stale `paymentDueDate` from the state.
   */
  const getDisplayDueDate = () => {
    const { invoiceDate, paymentTerms, paymentDueDate } = formData;
    if (invoiceDate && paymentTerms) {
      try {
        const datePart = invoiceDate.substring(0, 10);
        const [year, month, day] = datePart.split('-').map(Number);
        const startDate = new Date(year, month - 1, day);
        const terms = parseInt(paymentTerms, 10);
        if (!isNaN(terms)) {
          const calculatedDueDate = addDays(startDate, terms);
          return format(calculatedDueDate, 'dd MMM yyyy');
        }
      } catch (e) { /* Fallback on error */ }
    }
    return formatDate(paymentDueDate) || 'N/A';
  };

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
            <p className="meta-value">{formatDate(formData.invoiceDate) || 'YYYY-MM-DD'}</p>
          </div>
          <div className="payment-due-group">
            <p className="meta-label">Payment Due</p>
            <p className="meta-value">{getDisplayDueDate()}</p>
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