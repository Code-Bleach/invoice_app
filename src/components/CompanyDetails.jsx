import './CompanyDetails.css'; // For specific styles

function CompanyDetails({ isNew, formData, handleChange }) {
 // In new invoice mode, only client details are editable.
  // Sender details are now default and non-editable (set in useInvoiceForm.js)
  if (isNew) {
    return (
      <section className="company-details-form form-section">
        <h2 className="form-section-title">Bill To</h2>
        <div className="form-grid form-grid-col-1">
          <div>
            <label htmlFor="clientName">Client's Name</label>
            <input type="text" id="clientName" name="clientName" value={formData.clientName || ''} onChange={handleChange} placeholder="e.g. Alex Grim" />
          </div>
          <div>
            <label htmlFor="clientEmail">Client's Email</label>
            <input type="email" id="clientEmail" name="clientEmail" value={formData.clientEmail || ''} onChange={handleChange} placeholder="e.g. alexgrim@example.com" />
          </div>
          <div>
            <label htmlFor="clientStreet">Street Address</label>
            <input type="text" id="clientStreet" name="clientStreet" value={formData.clientStreet || ''} onChange={handleChange} placeholder="e.g. 84 Church Way" />
          </div>
        </div>
        <div className="form-grid form-grid-col-3"> {/* City, Post Code, Country */}
          <div>
            <label htmlFor="clientCity">City</label>
            <input type="text" id="clientCity" name="clientCity" value={formData.clientCity || ''} onChange={handleChange} placeholder="e.g. Bradford" />
          </div>
          <div>
            <label htmlFor="clientPostCode">Post Code</label>
            <input type="text" id="clientPostCode" name="clientPostCode" value={formData.clientPostCode || ''} onChange={handleChange} placeholder="e.g. BD1 9PB" />
          </div>
          <div>
            <label htmlFor="clientCountry">Country</label>
            <input type="text" id="clientCountry" name="clientCountry" value={formData.clientCountry || ''} onChange={handleChange} placeholder="e.g. United Kingdom" />
          </div>
        </div>
        <div className="form-grid form-grid-col-1"> {/* Phone on its own line */}
          <div>
            <label htmlFor="clientPhone">Phone</label>
            <input type="tel" id="clientPhone" name="clientPhone" value={formData.clientPhone || ''} onChange={handleChange} placeholder="e.g. +44 1274 390000" />
          </div>
        </div>
      </section>
    );
  }

   // Display mode (for existing invoices)
  return (
    <address className="sender-details-view">
      <p className="company-name">{formData.senderName || 'Your Company Name'}</p>
      <p>{formData.senderStreet || 'Your Company Street'}</p>
      <p>{formData.senderCity || 'Your City'}, {formData.senderPostCode || 'PostCode'}</p>
      <p>{formData.senderCountry || 'Your Country'}</p>
      {formData.senderPhone && <p>Tel: {formData.senderPhone}</p>}
      {formData.senderEmail && <p>{formData.senderEmail}</p>}
      {formData.senderWebsite && <p>{formData.senderWebsite}</p>}
    </address>
  );
}
export default CompanyDetails;