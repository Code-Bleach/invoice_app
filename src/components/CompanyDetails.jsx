import React, { useState, useCallback, useRef, useEffect } from 'react';
import './CompanyDetails.css'; // For specific styles

function CompanyDetails({ isNew, formData, handleChange }) {
  // State for postcode lookup and suggestions
  const [postcodeSuggestions, setPostcodeSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const suggestionsList = useRef(null);

  // Debounce helper to prevent API calls on every keystroke
  const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // Fetches full address details for a given postcode
  const fetchFullPostcodeDetails = useCallback(async (postcode) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
      const data = await response.json();
      if (data.status === 200) {
        const { result } = data;
        // Update parent form state using the passed-in handleChange function
        handleChange({ target: { name: 'clientPostCode', value: result.postcode } }); // Fix: Update postcode field itself
        handleChange({ target: { name: 'clientCity', value: result.admin_district || result.parliamentary_constituency || result.parish || '' } });
        handleChange({ target: { name: 'clientCountry', value: result.country || 'United Kingdom' } });
        handleChange({ target: { name: 'clientStreet', value: result.line_1 || '' } }); // Populate street if available
        setPostcodeSuggestions([]); // Clear suggestions after selection
      } else {
        setError(data.error || 'Invalid postcode.');
      }
    } catch (err) {
      setError('API request failed.');
    } finally {
      setIsLoading(false);
    }
  }, [handleChange]);

  // Fetches postcode autocomplete suggestions as the user types
  const fetchPostcodeSuggestions = useCallback(debounce(async (query) => {
    if (query.length < 2) {
      setPostcodeSuggestions([]);
      return;
    }
    setIsLoading(true);
    setError('');
    try { // Increased limit to 100 (max allowed by Postcode.io)
      const response = await fetch(`https://api.postcodes.io/postcodes/${query}/autocomplete?limit=100`);
      const data = await response.json();
      setPostcodeSuggestions(data.status === 200 && data.result ? data.result : []);
    } catch (err) {
      setError('Could not fetch suggestions.');
    } finally {
      setIsLoading(false);
    }
  }, 300), []);


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
            <label htmlFor="clientPostCode">Post Code</label>
            <div className="autocomplete-wrapper">
              <input
                type="text"
                id="clientPostCode"
                name="clientPostCode"
                value={formData.clientPostCode || ''}
                onChange={(e) => {
                  handleChange(e); // Update form state immediately
                  fetchPostcodeSuggestions(e.target.value); // Fetch suggestions
                }}
                onBlur={(e) => {
                  // On leaving the field, if it looks like a full postcode, try to look it up
                  if (e.target.value && e.target.value.length > 4 && postcodeSuggestions.includes(e.target.value.toUpperCase())) {
                    fetchFullPostcodeDetails(e.target.value);
                  }
                }}
                placeholder="e.g. BD1 9PB" />
              {isLoading && <p className="loading-message">Loading...</p>}
              {error && <p className="error-message">{error}</p>}
              {postcodeSuggestions.length > 0 && (
                <ul className="autocomplete-list" ref={suggestionsList}>
                  {postcodeSuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => fetchFullPostcodeDetails(suggestion)}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="form-grid form-grid-col-2"> {/* City, Street, Country */}
          <div>
            <label htmlFor="clientCity">City</label>
            <input type="text" id="clientCity" name="clientCity" value={formData.clientCity || ''} onChange={handleChange} placeholder="e.g. Bradford" readOnly />
          </div>
          <div>
            <label htmlFor="clientStreet">Street Address</label>
            <input type="text" id="clientStreet" name="clientStreet" value={formData.clientStreet || ''} onChange={handleChange} placeholder="e.g. 84 Church Way" />
          </div>
          <div>
            <label htmlFor="clientCountry">Country</label>
            <input type="text" id="clientCountry" name="clientCountry" value={formData.clientCountry || 'United Kingdom'} onChange={handleChange} placeholder="e.g. United Kingdom" readOnly />
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

  // Display mode (for existing invoices) - No changes needed here
  return (
    <address className="sender-details-view">
      <p className="company-name">{formData.senderName || 'Your Company Name'}</p>
      <p>{formData.senderStreet || 'Your Company Street'}</p>
      <p>{formData.senderCity || 'Your City'}, {formData.clientPostCode || 'PostCode'}</p>
      <p>{formData.senderCountry || 'Your Country'}</p>
      {formData.senderPhone && <p>Tel: {formData.senderPhone}</p>}
      {formData.senderEmail && <p>{formData.senderEmail}</p>}
      {formData.senderWebsite && <p>{formData.senderWebsite}</p>}
    </address>
  );
}
export default CompanyDetails;