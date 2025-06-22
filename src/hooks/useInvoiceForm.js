import { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Default company details
const DEFAULT_SENDER_DETAILS = {
  senderName: 'BarMi Prestige Construction Ltd',
  senderStreet: '19 Union Terrace',
  senderCity: 'London',
  senderPostCode: 'E1 3EZ',
  senderCountry: 'United Kingdom',
  senderPhone: '+44 7864 572628 /+44 1908 040246',
  senderEmail: 'info@barmiconstruction.co.uk',
  senderWebsite: 'barmiconstruction.co.uk',
};

const initialFormData = {
  id: '',
  status: 'draft',
  ...DEFAULT_SENDER_DETAILS, // Pre-fill sender details
  clientName: '',
  clientEmail: '',
  clientStreet: '',
  clientCity: '',
  clientPostCode: '',
  clientCountry: 'United Kingdom',
  clientPhone: '',
  invoiceDate: format(new Date(), 'yyyy-MM-dd'), // Default to today
  paymentTerms: 'Net 30 Days', // Default payment terms
  paymentDueDate: '', // Will be calculated
  projectDescription: '',
  items: [{ name: '', quantity: 0, price: 0 }],
  servicesDescription: '',
  serviceCharge: 0, // Default to 0, but will be required
  taxRate: 0.2,
  notes: 'Bank Details:\nAccount Name: BarMi Construction Ltd\nAccount No: 12345678\nSort Code: 12-34-56', // Default notes with bank details
  total: 0, // Calculated
};

export const useInvoiceForm = (existingInvoice) => {
  const [formData, setFormData] = useState(existingInvoice || initialFormData);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (existingInvoice) {
      // When an existing invoice is loaded, ensure its data is used
      // and merge with default sender details if they are missing (for older invoices)
      setFormData({ ...DEFAULT_SENDER_DETAILS, ...existingInvoice });
    } else {
      // For new invoices, reset to initial form data including defaults
      setFormData(initialFormData);
    }
  }, [existingInvoice]);

  // Calculate total whenever items, serviceCharge, or taxRate change
  useEffect(() => {
    const calculateTotal = () => {
      const itemsTotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
      const subtotal = itemsTotal + (Number(formData.serviceCharge) || 0);
      const taxAmount = subtotal * (Number(formData.taxRate) || 0);
      return (subtotal + taxAmount).toFixed(2);
    };
    setFormData(prev => ({ ...prev, total: calculateTotal() }));
  }, [formData.items, formData.serviceCharge, formData.taxRate]);

  // Calculate paymentDueDate whenever invoiceDate or paymentTerms change
  useEffect(() => {
    if (formData.invoiceDate && formData.paymentTerms) {
      const date = new Date(formData.invoiceDate);
      let dueDate = new Date(date);

      switch (formData.paymentTerms) {
        case 'Net 7 Days':
          dueDate.setDate(date.getDate() + 7);
          break;
        case 'Net 14 Days':
          dueDate.setDate(date.getDate() + 14);
          break;
        case 'Net 30 Days':
          dueDate.setDate(date.getDate() + 30);
          break;
        case 'Net 60 Days':
          dueDate.setDate(date.getDate() + 60);
          break;
        default:
          // If custom terms or no terms, leave as is or set to invoice date
          break;
      }
      setFormData(prev => ({ ...prev, paymentDueDate: format(dueDate, 'yyyy-MM-dd') }));
    }
  }, [formData.invoiceDate, formData.paymentTerms]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrorMessage(''); // Clear error message on change
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value,
    };
    setFormData(prev => ({ ...prev, items: newItems }));
    setErrorMessage(''); // Clear error message on change
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 0, price: 0 }],
    }));
  };

  const deleteItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    let errors = [];

    // Client details validation
    if (!formData.clientName) errors.push("Client's Name is required.");
    if (!formData.clientEmail) errors.push("Client's Email is required.");
    if (!formData.clientEmail && !formData.clientPhone) {
        errors.push("Client's Email or Phone is required.");
      } else if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) { // If email is provided, it must be valid.
      errors.push("Client's Email is not valid.");
    } else if (formData.clientPhone && !/^[+\d\s()-]{10,}$/.test(formData.clientPhone)) {
      // If phone is provided, it must be a valid format (at least 7 digits/allowed chars)
      errors.push("Client's Phone number is not valid.");
    }
    if (!formData.invoiceDate) errors.push("Invoice Date is required.");
    if (!formData.paymentTerms) errors.push("Payment Terms are required.");
    if (!formData.projectDescription) errors.push("Project Description is required.");
    
    // Items list is optional. Validate individual items only if they have some data.
    formData.items.forEach((item, index) => {
      // Only validate if the item has a name or non-zero quantity/price
      if (item.name || item.quantity > 0 || item.price > 0) {
        if (!item.name) errors.push(`Item ${index + 1}: Name is required.`);
        if (item.quantity < 0) errors.push(`Item ${index + 1}: Quantity cannot be negative.`);
        if (item.price < 0) errors.push(`Item ${index + 1}: Price cannot be negative.`);
      }
    });

    // Service Charge validation (now mandatory)
    if (formData.serviceCharge === null || formData.serviceCharge === undefined || formData.serviceCharge < 0) {
        errors.push("Service Charge is required and must be 0 or greater.");
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join('\n'));
      return false;
    }
    setErrorMessage('');
    return true;
  };

  return {
    formData,
    setFormData,
    errorMessage,
    setErrorMessage,
    validateForm,
    handleChange,
    handleItemChange,
    addItem,
    deleteItem,
  };
};
