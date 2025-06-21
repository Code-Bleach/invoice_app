import { useState, useEffect } from 'react';

const initialFormData = {
  senderName: 'BarMi Prestige Construction Ltd',
  senderStreet: 'Office G14 Fairbourne Drive Atterbury',
  senderCity: 'Milton Keynes',
  senderPostCode: 'MK10 9RG',
  senderCountry: 'United Kingdom',
  senderPhone: '+44 1908 040246 / +44 7864 572628',
  senderEmail: 'info@barmiconstruction.co.uk',
  senderWebsite: 'www.barmiconstruction.co.uk',
  clientName: '',
  clientEmail: '',
  clientStreet: '',
  clientCity: '',
  clientPostCode: '',
  clientCountry: 'United Kingdom',
  clientPhone: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  paymentTerms: '30',
  projectDescription: '',
  paymentDueDate: '',
  items: [],
  servicesDescription: '',
  serviceCharge: 0,
  taxRate: 0.20,
  notes: "Thank you for your business!",
  status: 'draft',
};

const calculateDueDate = (invoiceDateStr, paymentTermsStr) => {
  if (!invoiceDateStr || !paymentTermsStr) return '';
  const date = new Date(invoiceDateStr);
  const terms = parseInt(paymentTermsStr, 10);
  if (isNaN(terms) || terms < 0) return '';
  date.setDate(date.getDate() + terms);
  return date.toISOString().slice(0, 10);
};

const generateNotesWithDueDate = (dueDate, baseNote = "Thank you for your business!") => {
  return dueDate ? `${baseNote}\nPayment is due by ${dueDate}.` : `${baseNote}\nPayment terms will apply.`;
};

export function useInvoiceForm(existingInvoice = null) {
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (existingInvoice) {
      const dueDate = existingInvoice.paymentDueDate || calculateDueDate(existingInvoice.invoiceDate, existingInvoice.paymentTerms);
      const notes = existingInvoice.notes || generateNotesWithDueDate(dueDate, existingInvoice.notes?.split('\n')[1] || "Thank you for your business!");
      setFormData({ ...initialFormData, ...existingInvoice, paymentDueDate: dueDate, notes });
    } else {
      const initialDueDate = calculateDueDate(initialFormData.invoiceDate, initialFormData.paymentTerms);
      const initialNotes = generateNotesWithDueDate(initialDueDate);
      setFormData({ ...initialFormData, paymentDueDate: initialDueDate, notes: initialNotes });
    }
  }, [existingInvoice]);

  useEffect(() => {
    if (formData.invoiceDate && formData.paymentTerms) {
      const newDueDate = calculateDueDate(formData.invoiceDate, formData.paymentTerms);
      const baseNote = formData.notes?.split('\n')[0] || "Thank you for your business!";
      const newNotes = generateNotesWithDueDate(newDueDate, baseNote);
      if (newDueDate !== formData.paymentDueDate || newNotes !== formData.notes) {
        setFormData(prev => ({ ...prev, paymentDueDate: newDueDate, notes: newNotes }));
      }
    }
  }, [formData.invoiceDate, formData.paymentTerms, formData.notes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { name: '', quantity: 1, price: 0, total: 0 }] }));

  const deleteItem = (indexToDelete) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, index) => index !== indexToDelete) }));

  const validateForm = () => {
    setErrorMessage('');
    const requiredFields = {
      senderName: "Sender's Name", senderStreet: "Sender Street Address", senderCity: "Sender City", senderPostCode: "Sender Post Code", senderCountry: "Sender Country", senderPhone: "Sender Phone", senderEmail: "Sender Email", senderWebsite: "Sender Website",
      clientName: "Client's Name", clientEmail: "Client's Email", clientStreet: "Client Street Address", clientCity: "Client City", clientPostCode: "Client Post Code", clientCountry: "Client Country",
      invoiceDate: "Invoice Date", paymentTerms: "Payment Terms", projectDescription: "Project Description",
    };
    for (const [field, MappedName] of Object.entries(requiredFields)) {
      if (!formData[field] || String(formData[field]).trim() === '') {
        setErrorMessage(`Please fill in the ${MappedName} field.`);
        return false;
      }
    }
    if (formData.items.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
      setErrorMessage("All items must have a name, and quantity/price must be greater than zero.");
      return false;
    }
    return true;
  };

  return { formData, setFormData, errorMessage, setErrorMessage, validateForm, handleChange, handleItemChange, addItem, deleteItem };
}

