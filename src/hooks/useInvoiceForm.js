import { useState, useEffect } from 'react';

const initialFormData = {
  senderName: 'BarMi Prestige Construction Ltd',
  senderStreet: 'Office G14, Fairbourne Drive, Atterbury',
  senderCity: 'Milton Keynes',
  senderPostCode: 'MK10 9RG',
  senderCountry: 'United Kingdom',
  senderPhone: '+44 1908 040246',
  senderEmail: 'info@barmiconstruction.co.uk',
  senderWebsite: 'www.barmiconstruction.co.uk',
  clientName: '',
  clientEmail: '',
  clientStreet: '',
  clientCity: '',
  clientPostCode: '',
  clientCountry: 'United Kingdom', // Default and non-editable
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

const bankDetails = `
Payment Details:
Account Name: BarMi Prestige Construction Ltd
Account No: 63468496
Sort Code: 20-57-44`;

const generateNotesWithDueDate = (dueDate, baseNote = "Thank you for your business!") => {
  const paymentLine = dueDate ? `Payment is due by ${dueDate}.` : `Payment terms will apply.`;
  return `${baseNote}\n${paymentLine}\n${bankDetails}`;
};

export function useInvoiceForm(existingInvoice = null) {
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (existingInvoice) {
      const dueDate = existingInvoice.paymentDueDate || calculateDueDate(existingInvoice.invoiceDate, existingInvoice.paymentTerms);
      const notes = existingInvoice.notes || generateNotesWithDueDate(dueDate, existingInvoice.notes?.split('\n')[0] || "Thank you for your business!");
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
  }, [formData.invoiceDate, formData.paymentTerms]);

  const toTitleCase = (str) => str.replace(/\b\w/g, char => char.toUpperCase());

  const handleChange = (e) => {
    let { name, value } = e.target;
    const titleCaseFields = ['clientName', 'clientStreet', 'clientCity', 'projectDescription'];
    if (titleCaseFields.includes(name)) {
      value = toTitleCase(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { name: '', quantity: 1, price: 0, total: 0 }] }));
  const deleteItem = (indexToDelete) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, index) => index !== indexToDelete) }));

  const validateForm = () => {
    setErrorMessage('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2})$/i;

    if (!formData.clientName || !formData.clientEmail || !formData.projectDescription) {
      setErrorMessage("Please fill in all required client and project fields.");
      return false;
    }
    if (!emailRegex.test(formData.clientEmail)) {
      setErrorMessage("Please enter a valid client email address.");
      return false;
    }
    if (formData.clientPostCode && !ukPostcodeRegex.test(formData.clientPostCode)) {
      setErrorMessage("Please enter a valid UK postcode.");
      return false;
    }
    return true;
  };

  return { formData, setFormData, errorMessage, setErrorMessage, validateForm, handleChange, handleItemChange, addItem, deleteItem };
}