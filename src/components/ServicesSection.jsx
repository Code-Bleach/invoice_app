import './ServicesSection.css'; // Optional: for specific styles

function ServicesSection({ isNew, formData, handleChange }) {
  if (!isNew) {
    // Display mode for existing invoices
    if (!formData.servicesDescription && (formData.serviceCharge === 0 || formData.serviceCharge === undefined)) {
      return null; // Don't render if no service info in display mode
    }
    return (
      <section className="services-section">
        <h2>Services Provided</h2>
        {formData.servicesDescription && <pre className="services-description-display">{formData.servicesDescription}</pre>}
        <p><strong>Service Charge:</strong> £{(formData.serviceCharge || 0).toFixed(2)}</p>
      </section>
    );
  }

  // Form mode for new/editing invoices
  return (
    <section className="services-section form-section">
      <h2>Services</h2>
      <label htmlFor="servicesDescription">Describe Services Rendered (list each service on a new line if preferred)</label>
      <textarea id="servicesDescription" name="servicesDescription" value={formData.servicesDescription} onChange={handleChange} rows="5" placeholder="e.g. Removal of old tiles&#x0a;Dry wall installation&#x0a;Plumbing for new sink"></textarea>
      
      <label htmlFor="serviceCharge">Total Service Charge</label>
      <input type="number" id="serviceCharge" name="serviceCharge" value={formData.serviceCharge} onChange={(e) => handleChange({ target: { name: 'serviceCharge', value: parseFloat(e.target.value) || 0 }})} placeholder="0.00" step="0.01" min="0" />
    </section>
  );
}

export default ServicesSection;