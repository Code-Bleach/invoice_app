const API_BASE_URL = 'http://localhost:5001/api'; // Adjust if your backend runs on a different port/host

/**
 * Fetches invoices from the backend.
 * @param {string} queryString - The query string for filtering (e.g., "status=paid&status=pending").
 * @returns {Promise<Array>} A promise that resolves to an array of invoices.
 */
export const getInvoices = async (queryString = '') => {
  const response = await fetch(`${API_BASE_URL}/invoices${queryString ? `?${queryString}` : ''}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

/**
 * Adds a new invoice to the backend.
 * @param {Object} newInvoiceData - The data for the new invoice.
 * @returns {Promise<Object>} A promise that resolves to the added invoice.
 */
export const addInvoice = async (newInvoiceData) => {
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newInvoiceData),
  });
  if (!response.ok) {
    throw new Error('Failed to add invoice');
  }
  return response.json();
};

/**
 * Updates an existing invoice on the backend.
 * @param {Object} updatedInvoiceData - The data for the updated invoice (must contain ID).
 * @returns {Promise<Object>} A promise that resolves to the updated invoice.
 */
export const updateInvoice = async (updatedInvoiceData) => {
  const response = await fetch(`${API_BASE_URL}/invoices/${updatedInvoiceData.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedInvoiceData),
  });
  if (!response.ok) throw new Error('Failed to update invoice');
  return response.json();
};

/**
 * Deletes an invoice from the backend.
 * @param {string} invoiceIdToDelete - The ID of the invoice to delete.
 * @returns {Promise<void>} A promise that resolves when the invoice is deleted.
 */
export const deleteInvoice = async (invoiceIdToDelete) => {
  const response = await fetch(`${API_BASE_URL}/invoices/${invoiceIdToDelete}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete invoice');
  // No content expected for 204 No Content response
};