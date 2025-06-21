import './CompanyDetails.css'; // For specific styles

function CompanyDetails({ isNew, formData, handleChange }) {
  if (isNew) {
    return (
      <section className="company-details-form form-section"> {/* Changed class name for clarity */}
        <h2 className="form-section-title">Bill From</h2>
          <div className="form-grid form-grid-col-1"> {/* Company Name and Street Address on same line */}
            <div>
              <label htmlFor="senderName">Company</label>
              <input type='text' id="senderName" name="senderName" value={formData.senderName} onChange={handleChange} placeholder="BarMi Prestige Construction Ltd" />
            </div>
          </div>
            <div>
              <label htmlFor="senderStreet">Address</label>
              <input type="text" id="senderStreet" name="senderStreet" value={formData.senderStreet} onChange={handleChange} placeholder="e.g. 19 Union Terrace" />
            </div>
          <div className="form-grid form-grid-col-3"> {/* City, Post Code, Country */}
            <div>
              <label htmlFor="senderCity">City</label>
              <input type="text" id="senderCity" name="senderCity" value={formData.senderCity || ''} onChange={handleChange} placeholder="e.g. London" />
            </div>
            <div>
              <label htmlFor="senderPostCode">Post Code</label>
              <input type="text" id="senderPostCode" name="senderPostCode" value={formData.senderPostCode || ''} onChange={handleChange} placeholder="e.g. E1 3EZ" />
            </div>
            <div>
              <label htmlFor="senderCountry">Country</label>
              <input type="text" id="senderCountry" name="senderCountry" value={formData.senderCountry || ''} onChange={handleChange} placeholder="e.g. United Kingdom" />
            </div>
            <div>
              <label htmlFor="senderPhone">Phone</label>
              <input type="tel" id="senderPhone" name="senderPhone" value={formData.senderPhone || ''} onChange={handleChange} placeholder="e.g. +44 20 7946 0000" />
            </div>
            <div>
              <label htmlFor="senderEmail">Email</label>
              <input type="email" id="senderEmail" name="senderEmail" value={formData.senderEmail || ''} onChange={handleChange} placeholder="info@barmi" />
            </div>
            <div>
              <label htmlFor="senderWebsite">Email</label>
              <input type="text" id="senderWebsite" name="senderWebsite" value={formData.senderWebsite || ''} onChange={handleChange} placeholder="barmiconstruction.co.uk" />
            </div>
          </div>

        <h2 className="form-section-title">Bill To</h2>
          <div className="form-grid form-grid-col-1">
            <div>
              <label htmlFor="clientName">Client's Name</label>
              <input type="text" id="clientName" name="clientName" value={formData.clientName || ''} onChange={handleChange} placeholder="e.g. Alex Grim" />
            </div>
            <div>
              <label htmlFor="clientEmail">Client's Email</label>
              <input type="email" id="clientEmail" name="clientEmail" value={formData.clientEmail || ''} onChange={handleChange} placeholder="e.g. alexgrim@mail.com" />
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
    <address className="sender-details-view"> {/* Changed to address and new class for view */}
      {/* No "From:" h2 needed here as it's implied by position in invoice-tediko */}
      {/* Or, if you want to keep it, style it very subtly or remove it if layout implies it */}
      <div>{formData.senderStreet || 'Your Company Street'}</div>
      <div>{formData.senderCity || 'Your City'}, {formData.senderPostCode || 'PostCode'}</div>
      <div>{formData.senderCountry || 'Your Country'}</div>
      {formData.senderPhone && <div>Phone: {formData.senderPhone}</div>}
    </address>
  );
}

export default CompanyDetails;