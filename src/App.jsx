import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import InvoiceListPage from './InvoiceListPage';
import InvoiceDetailPage from './InvoiceDetailPage';
import GlobalSideNav from './components/GlobalSideNav';
import { getInvoices, addInvoice as apiAddInvoice, updateInvoice as apiUpdateInvoice, deleteInvoice as apiDeleteInvoice } from './api/invoices';
import './AppLayout.css'; // CSS for the overall app layout

const LOCAL_STORAGE_KEY_THEME = 'appTheme';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEY_THEME) || 'light'); // 'light' or 'dark'
  const [activeFilters, setActiveFilters] = useState([]); // e.g., ['pending', 'paid']

  // Centralized function to fetch invoices based on current filters
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build the query string from active filters correctly
      const params = new URLSearchParams();
      activeFilters.forEach(filter => params.append('status', filter));
      const queryString = params.toString();

      setInvoices(await getInvoices(queryString));
    } catch (error) {
      setError(error.message || 'Failed to fetch invoices.');
      console.error("Failed to fetch invoices:", error);
      setInvoices([]); // Set to empty array on error to avoid crashes
    } finally {
      setLoading(false); // This will run after the try or catch block
    }
  }, [activeFilters]);
  const addInvoice = async (newInvoiceData) => { // Renamed to avoid conflict with imported apiAddInvoice
        try {
          const addedInvoice = await apiAddInvoice(newInvoiceData);
          
          // Reset filters and refetch all invoices to show the new one at the top
          setActiveFilters([]);
          console.log("New invoice added with ID:", addedInvoice.id);
          return addedInvoice;
          
        } catch (error) {
          console.error("Error adding invoice:", error);
          return null;
        }
      };

  const updateInvoice = async (updatedInvoiceData) => {
        try {
          const updatedInvoice = await apiUpdateInvoice(updatedInvoiceData);
          // Refetch to ensure the list is correctly filtered and sorted
          await fetchInvoices();

          console.log("Invoice updated:", updatedInvoice);
        } catch (error) {
          console.error("Error updating invoice:", error);
        }
      };
    
      const deleteInvoice = async (invoiceIdToDelete) => {
        try {
          await apiDeleteInvoice(invoiceIdToDelete);
          // Refetch to update the list
          await fetchInvoices();
          console.log("Invoice deleted:", invoiceIdToDelete);
        } catch (error) {
          console.error("Error deleting invoice:", error);
        }
      };
    
      const markInvoiceAsPaid = async (invoiceIdToMark) => {
        const invoiceToUpdate = invoices.find(inv => inv.id === invoiceIdToMark);
        if (invoiceToUpdate) {
          await updateInvoice({ ...invoiceToUpdate, status: 'paid' });
          console.log("Invoice marked as paid:", invoiceIdToMark);
        }
      };
    
      const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
      };
    
    // Effect to fetch invoices from the server whenever filters change
    useEffect(() => {
      fetchInvoices();
    }, [fetchInvoices]); // Re-run when the memoized fetchInvoices function changes
    
      // Effect to save theme to localStorage whenever it changes
      useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
  }, [theme]);

  return (
    <div className={`app-container theme-${theme}`}>
      <GlobalSideNav currentTheme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={<InvoiceListPage 
              invoices={invoices}
              loading={loading}
              error={error}
              activeFilters={activeFilters} 
              setActiveFilters={setActiveFilters} />}
          />
          <Route 
            path="/invoice/new" 
    element={<InvoiceDetailPage addInvoice={addInvoice} invoices={invoices} updateInvoice={updateInvoice} deleteInvoice={deleteInvoice} markInvoiceAsPaid={markInvoiceAsPaid} theme={theme} />}
          />
          <Route 
            path="/invoice/:invoiceId" 
    element={<InvoiceDetailPage invoices={invoices} addInvoice={addInvoice} updateInvoice={updateInvoice} deleteInvoice={deleteInvoice} markInvoiceAsPaid={markInvoiceAsPaid} theme={theme} />}
          />
        </Routes>
        </main>
    </div>
  );
}

export default App;
