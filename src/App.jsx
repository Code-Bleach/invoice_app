import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import InvoiceListPage from './InvoiceListPage';
import InvoiceDetailPage from './InvoiceDetailPage';
import GlobalSideNav from './components/GlobalSideNav';
import './AppLayout.css'; // CSS for the overall app layout

const LOCAL_STORAGE_KEY_THEME = 'appTheme';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEY_THEME) || 'light'); // 'light' or 'dark'
  const [activeFilters, setActiveFilters] = useState([]); // e.g., ['pending', 'paid']

  // Centralized function to fetch invoices based on current filters
  const fetchInvoices = async () => {
    try {
      // Build the query string from active filters
      const query = activeFilters.length > 0 ? `?status=${activeFilters.join(',')}` : '';
      const response = await fetch(`/api/invoices${query}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]); // Set to empty array on error to avoid crashes
    }
  };

  const addInvoice = async (newInvoiceData) => {
        try {
          const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInvoiceData),
          });
          if (!response.ok) throw new Error('Failed to add invoice');
          
          const addedInvoice = await response.json();
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
          const response = await fetch(`/api/invoices/${updatedInvoiceData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedInvoiceData),
          });
          if (!response.ok) throw new Error('Failed to update invoice');
          const updatedInvoice = await response.json();
          // Refetch to ensure the list is correctly filtered and sorted
          await fetchInvoices();

          console.log("Invoice updated:", updatedInvoice);
        } catch (error) {
          console.error("Error updating invoice:", error);
        }
      };
    
      const deleteInvoice = async (invoiceIdToDelete) => {
        try {
          const response = await fetch(`/api/invoices/${invoiceIdToDelete}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Failed to delete invoice');
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
      }, [activeFilters]); // Re-run when filters change
    
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
