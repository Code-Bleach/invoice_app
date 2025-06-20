import { useMatch, useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import './InvoiceDetailPage.css';
import './FormStyles.css'; // Assuming general form styles are here

import Header from './components/Header';
import CompanyDetails from './components/CompanyDetails';
import InvoiceInfo from './components/InvoiceInfo';
import ItemsTable from './components/ItemsTable';
import ServicesSection from './components/ServicesSection';
import InvoiceTotals from './components/InvoiceTotals';
import Notes from './components/Notes';
import Actions from './components/Actions';
import FormErrorMessage from './components/FormErrorMessage';
import ConfirmationModal from './components/ConfirmationModal';
import SendOptionsModal from './components/SendOptionsModal';
// import InvoiceListItem from './components/InvoiceListItem'; // For status badge styling (already in InvoiceDetailPage.css)
import barmilogoLight from './assets/barmilogo-light.png';
import barmilogoDark from './assets/barmilogo-dark.png';

function InvoiceDetailPage({ addInvoice, invoices, updateInvoice, deleteInvoice, markInvoiceAsPaid, theme }) {
  const isNewInvoiceRoute = useMatch("/invoice/new");
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId } = useParams();

  const isNew = !invoiceId && !!isNewInvoiceRoute;
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(isNew); // Start in edit mode if new
  const [originalInvoiceData, setOriginalInvoiceData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormClosing, setIsFormClosing] = useState(false);
  const [isSendOptionsModalOpen, setIsSendOptionsModalOpen] = useState(false);
  const [invoiceForSendOptions, setInvoiceForSendOptions] = useState(null);
  const [isGuideMessageOpen, setIsGuideMessageOpen] = useState(false);
  const [guideMessageText, setGuideMessageText] = useState('');
  const invoiceViewRef = useRef(null);


  const ANIMATION_DURATION = 400;

  const initialFormData = {
    senderStreet: 'Office G14 Fairbourne Drive Atterbury',
    senderCity: 'Milton Keynes',
    senderPostCode: 'MK10 9RG',
    senderCountry: 'United Kingdom',
    senderPhone: '+44 1908 040246',
    clientName: '',
    clientEmail: '',
    clientStreet: '',
    clientCity: '',
    clientPostCode: '',
    clientCountry: '',
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
    status: 'draft', // New invoices start as draft
  };

  const [formData, setFormData] = useState(initialFormData);

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

  useEffect(() => {
    console.log('[InvoiceDetailPage useEffect] Running. invoiceId:', invoiceId, 'isNew:', isNew, 'location.state:', location.state);

    if (invoiceId && invoices) {
      const existingInvoice = invoices.find(inv => inv.id === invoiceId);
      if (existingInvoice) {
        const dueDate = existingInvoice.paymentDueDate || calculateDueDate(existingInvoice.invoiceDate, existingInvoice.paymentTerms);
        const notes = existingInvoice.notes || generateNotesWithDueDate(dueDate, existingInvoice.notes?.split('\n')[0] || "Thank you for your business!");
        const fullExistingData = { ...initialFormData, ...existingInvoice, paymentDueDate: dueDate, notes: notes };
        setFormData(fullExistingData);
        setOriginalInvoiceData(fullExistingData);
        setIsEditMode(false); // Start in view mode for existing invoices

        console.log('[InvoiceDetailPage useEffect] Checking for showSendOptions. location.state:', location.state, 'existingInvoice.id:', existingInvoice.id, 'invoiceId:', invoiceId);
        // Handle opening send options modal if requested by navigation state
        if (location.state?.showSendOptions && existingInvoice.id === invoiceId) {
          console.log('[InvoiceDetailPage useEffect] showSendOptions condition met. Opening modal.');
          setInvoiceForSendOptions(fullExistingData);
          setIsSendOptionsModalOpen(true);
          navigate(location.pathname, { replace: true, state: {} });
        }

          console.log('[InvoiceDetailPage useEffect] Checking for triggerAction. location.state:', location.state, 'existingInvoice.id:', existingInvoice.id, 'invoiceId:', invoiceId);
        // Handle triggering email/share action if requested by navigation state
        if (location.state?.triggerAction && existingInvoice.id === invoiceId) {
         // if (location.state.triggerAction === 'email') {
        //     executeEmailAction(fullExistingData);
        //   } else if (location.state.triggerAction === 'share') {
        //     executeShareAction(fullExistingData);
        //   }
        //   // Clear the triggerAction from state after processing
        //   navigate(location.pathname, { replace: true, state: {} });
            const actionToTrigger = location.state.triggerAction;
             console.log('[InvoiceDetailPage useEffect] triggerAction condition met. Action:', actionToTrigger);
             const dataForAction = { ...fullExistingData }; // Capture data to avoid issues with stale closures

          // Clear the triggerAction from state immediately so it doesn't re-trigger
          // navigate(location.pathname, { replace: true, state: {} }); 
          // ^ We'll move this clearing to *after* the action is attempted or if it's not one of ours.

          // Defer the execution slightly to ensure DOM is ready and to help with trusted event context
          setTimeout(() => {
             console.log(`[InvoiceDetailPage useEffect setTimeout] Attempting to trigger action: ${actionToTrigger} for invoice: ${dataForAction.id}`);
            if (actionToTrigger === 'email') {
              executeEmailAction(dataForAction);
            } else if (actionToTrigger === 'share') {
              executeShareAction(dataForAction);
            }
            // Clear the state after attempting the action
            navigate(location.pathname, { replace: true, state: {} });
          }, 100); // A small delay like 100ms. 0ms can also work.
        }

      } else {
        console.error("[InvoiceDetailPage useEffect] Invoice not found with ID:", invoiceId);
        navigate('/');
      }
    } else if (isNew) {
      console.log('[InvoiceDetailPage useEffect] Setting up for new invoice.');
      const initialDueDate = calculateDueDate(initialFormData.invoiceDate, initialFormData.paymentTerms);
      const initialNotes = generateNotesWithDueDate(initialDueDate);
      setFormData({ ...initialFormData, paymentDueDate: initialDueDate, notes: initialNotes, status: 'draft' });
      setIsEditMode(true); // New invoices start in edit mode
    }
  }, [invoiceId, invoices, isNew, navigate, location.state]);

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
  
    // Function to generate a new unique invoice ID
  const generateNewInvoiceId = () => {
    return `INV-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
  };

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

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0, total: 0 }]
    }));
  };

  const deleteItem = (indexToDelete) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== indexToDelete)
    }));
  };

  const validateForm = () => {
    setErrorMessage('');
    const requiredFields = {
      senderStreet: "Sender Street Address", senderCity: "Sender City", senderPostCode: "Sender Post Code", senderCountry: "Sender Country",
      clientName: "Client's Name", clientEmail: "Client's Email", clientStreet: "Client Street Address", clientCity: "Client City", clientPostCode: "Client Post Code", clientCountry: "Client Country",
      invoiceDate: "Invoice Date", paymentTerms: "Payment Terms", projectDescription: "Project Description",
    };
    for (const [field, MappedName] of Object.entries(requiredFields)) {
      const value = formData[field];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
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

  // Ensure closeFormAndNavigate is defined to accept and use navigationState
const closeFormAndNavigate = (path = '/', navigationState = {}) => { // Ensure navigationState is a parameter
  setIsFormClosing(true);
  setTimeout(() => {
    setIsEditMode(false);
    setIsFormClosing(false);
    setFormData(initialFormData); // Reset form for next time
    navigate(path, navigationState); // Pass the state here
  }, ANIMATION_DURATION);
};
 // Make sure this function is correctly passing navigationState if it's used elsewhere with state


  const handleSaveDraft = () => {
    if (!validateForm()) return;
     const draftInvoice = { ...formData, status: 'draft', id: formData.id || generateNewInvoiceId() };
    if (formData.id) {
      updateInvoice(draftInvoice);
      setOriginalInvoiceData(draftInvoice); // Update original data after saving changes to draft
      closeFormAndNavigate(`/invoice/${draftInvoice.id}`); // Go to view mode of this draft
    } else {
      const newDraft = addInvoice(draftInvoice);
      closeFormAndNavigate(`/invoice/${newDraft.id}`); // Go to view mode of new draft
    }
  };

  const handleSaveAndSend = () => { // For new invoices
    if (!validateForm()) return;
   // For new invoices, just open the modal. The form remains.
    // The decision to save as draft/pending and navigate happens based on modal action.
    setInvoiceForSendOptions({ ...formData }); // Pass current form data to the modal
    setIsSendOptionsModalOpen(true);
    
    // if (isNew) { // Only close the form part if it's a new invoice
    //   setIsFormClosing(true);
    //   setTimeout(() => {
    //     setIsEditMode(false); // This will make isFormActive false, hiding the form
    //     setIsFormClosing(false);
    //     // DO NOT call setFormData(initialFormData) here
    //     // DO NOT call navigate('/') here
    //     // These will be handled by the modal's outcome (email, share, or close)
    //   }, ANIMATION_DURATION);
    // }
  };
  
  const handleSendDraft = () => { // For existing drafts
    if (formData.id && formData.status === 'draft') {
      setInvoiceForSendOptions({ ...formData });
      setIsSendOptionsModalOpen(true);
    }
  };

  const handleUpdateInvoice = () => { // "Save Changes" when editing an existing draft
    if (!validateForm()) return;
    const updatedData = { ...formData, status: 'draft' }; // Saving changes keeps it as draft
    updateInvoice(updatedData);
    setOriginalInvoiceData(updatedData);
    setIsFormClosing(true);
    setTimeout(() => {
      setIsEditMode(false);
      setIsFormClosing(false);
    }, ANIMATION_DURATION);
  };

  const handleDiscard = () => {
    closeFormAndNavigate('/');
  };

  const handleCancelEdit = () => {
    setErrorMessage('');
    setIsFormClosing(true);
    setTimeout(() => {
      setFormData(originalInvoiceData || initialFormData);
      setIsEditMode(false);
      setIsFormClosing(false);
    }, ANIMATION_DURATION);
  };

  const handleDeleteInvoice = () => setIsDeleteModalOpen(true);
  const confirmDelete = () => {
    deleteInvoice(formData.id);
    setIsDeleteModalOpen(false);
    navigate('/');
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleMarkAsPaid = () => {
    if (formData.id && formData.status === 'pending') {
      const paidInvoice = { ...formData, status: 'paid' };
      updateInvoice(paidInvoice);
      setFormData(paidInvoice); // Update local UI
    }
  };

  const generatePDF = async (invoice, inputElement, forSharing = false) => {
    if (!inputElement) {
      console.error("PDF generation error: Input element for html2canvas not found.");
      return null;
    }
    try {
      const canvas = await html2canvas(inputElement, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        windowHeight: inputElement.scrollHeight, scrollY: -window.scrollY
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      if (forSharing) {
        const pdfBlob = pdf.output('blob');
        return new File([pdfBlob], `invoice-${invoice.id?.substring(0,8) || 'new'}.pdf`, { type: 'application/pdf' });
      } else {
        pdf.save(`invoice-${invoice.id?.substring(0,8) || 'new'}.pdf`); // This is standard
        return true;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  // This function now handles saving/updating the invoice to 'pending' status
  // It's called by handleEmailInvoice and handleShareInvoice
  const finalizeAndSaveAsPending = (invoiceDataToSave) => {
     const finalInvoice = {
      ...invoiceDataToSave,
      status: 'pending',
      // Only generate a new ID if one doesn't exist (for new invoices from the modal)
      id: invoiceDataToSave.id || generateNewInvoiceId()
    };
    // Check if this is a new invoice being saved for the first time as pending
    if (!invoiceDataToSave.id) { // This implies it came from the new invoice form via modal
      const newlyAddedInvoice = addInvoice(finalInvoice);
      setFormData(newlyAddedInvoice); // Update local state with the full new invoice
      return newlyAddedInvoice;
    } else { // It was an existing draft
      updateInvoice(finalInvoice);
      setFormData(finalInvoice); // Update local state
      return finalInvoice;
    }
  };

  const handleEmailInvoice = async (invoiceDataFromModal) => {
    // If invoiceDataFromModal has no ID, it's from a new invoice form.
    // Otherwise, it's an existing draft being sent.
    const wasNewInvoiceFlow = !invoiceDataFromModal.id;
    const finalPendingInvoice = finalizeAndSaveAsPending(invoiceDataFromModal); // Saves as pending, gets ID if new

    if (wasNewInvoiceFlow) {
      // Form closes, navigates to view the new pending invoice.
      // closeFormAndNavigate(`/invoice/${finalPendingInvoice.id}`);
    // Pass a state to trigger the email action after navigation.
      setIsSendOptionsModalOpen(false); // Close modal before navigating
      closeFormAndNavigate(`/invoice/${finalPendingInvoice.id}`, { state: { triggerAction: 'email' } });
    } else {
      await executeEmailAction(finalPendingInvoice); // For existing invoices, execute directly
      setIsSendOptionsModalOpen(false); // Just close modal
    }
  };

  const handleDownloadPDFInvoice = async (invoiceDataFromModal) => {
    const input = invoiceViewRef.current;
    if (!input) {
      alert("Please view the invoice to download its PDF. If you just sent it, it's now pending.");
      setIsSendOptionsModalOpen(false);
      return;
    }
    // If modal was opened from view mode, invoiceDataFromModal is the current formData
    await generatePDF(invoiceDataFromModal, input);
    setIsSendOptionsModalOpen(false);
  };

  const handlePrintInvoice = () => {
    if (invoiceViewRef.current) {
      const performActualPrint = () => window.print();
      const handleAfterPrint = () => {
        document.body.classList.remove('print-active');
        window.removeEventListener('afterprint', handleAfterPrint);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      document.body.classList.add('print-active');
      requestAnimationFrame(() => requestAnimationFrame(performActualPrint));
    } else {
      alert("Invoice content not available for printing. Please view the invoice first.");
    }
    setIsSendOptionsModalOpen(false);
  };

  const handleShareInvoice = async (invoiceDataFromModal) => {
    // If invoiceDataFromModal has no ID, it's from a new invoice form.
    const wasNewInvoiceFlow = !invoiceDataFromModal.id;
    const finalPendingInvoice = finalizeAndSaveAsPending(invoiceDataFromModal); // Saves as pending, gets ID if new

    // const input = invoiceViewRef.current; // Will be null if called from new invoice form
    // let pdfFile = null;

    // if (input) { // If view is rendered
    //   pdfFile = await generatePDF(finalPendingInvoice, input, true);
    // }

    // if (navigator.share && navigator.canShare) {
    //   const shareData = {
    //     title: `Invoice #${finalPendingInvoice.id.substring(0,8)} from BarMiConstruction`,
    //     text: `Invoice from BarMiConstruction for ${finalPendingInvoice.clientName}. Due: ${finalPendingInvoice.paymentDueDate || calculateDueDate(finalPendingInvoice.invoiceDate, finalPendingInvoice.paymentTerms)}, Amount: £${(finalPendingInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(finalPendingInvoice.serviceCharge) || 0) + ((finalPendingInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(finalPendingInvoice.serviceCharge) || 0)) * (Number(finalPendingInvoice.taxRate) || 0))).toFixed(2)}.`,
    //   };
    //   if (pdfFile && navigator.canShare({ files: [pdfFile] })) {
    //     shareData.files = [pdfFile];
    //   } else if (!pdfFile && wasNewInvoiceFlow) { // Check if it was the new invoice flow
    //      alert("Invoice will be shared as text. PDF can be shared after viewing the saved invoice.");
    //   } else if (!pdfFile && !wasNewInvoiceFlow) { // Existing invoice, PDF gen failed
    //      alert("PDF generation failed or content not ready. Sharing text only.");
    //   }

    //   try {
    //     await navigator.share(shareData);
    //   } catch (error) {
    //     console.error('Error sharing invoice:', error);
    //   }
    // } else {
    //   alert('Web Share API (with file sharing) not supported in your browser.');
    // }

    if (wasNewInvoiceFlow) {
      // Form closes, navigates to view the new pending invoice.
      // closeFormAndNavigate(`/invoice/${finalPendingInvoice.id}`); 
    // Pass a state to trigger the share action after navigation.
      setIsSendOptionsModalOpen(false); // Close modal before navigating
      closeFormAndNavigate(`/invoice/${finalPendingInvoice.id}`, { state: { triggerAction: 'share' } });
    } else {
      // For existing invoices, execute directly
      await executeShareAction(finalPendingInvoice);
      setIsSendOptionsModalOpen(false);
    }
  };

  const handleModalCloseAction = () => {
    // This is called when the modal's "Close" button is clicked.
    // If invoiceForSendOptions has no ID, it means it was from the "Save & Send" of a new invoice.
    // In this case, save as draft and navigate.
    if (invoiceForSendOptions && !invoiceForSendOptions.id && isNew) {
     const draftInvoice = { ...invoiceForSendOptions, status: 'draft', id: generateNewInvoiceId() };
     const newDraft = addInvoice(draftInvoice);
      closeFormAndNavigate(`/invoice/${newDraft.id}`); // Navigate to view the new draft
    } else {
      setIsSendOptionsModalOpen(false); // Just close if it was an existing invoice or an action was already taken
    }
  };

  const openSendOptionsForExisting = () => {
    setInvoiceForSendOptions(formData);
    setIsSendOptionsModalOpen(true);
  };

  // Extracted logic for actually performing the email action
  const executeEmailAction = async (invoiceToEmail) => {
    console.log("[executeEmailAction] Started for", invoiceToEmail.id, "Ref available:", !!invoiceViewRef.current);
    const input = invoiceViewRef.current; // Should be available now
    let pdfGenerated = false;

    if (input) {
      pdfGenerated = await generatePDF(invoiceToEmail, input);
    } else {
      alert("Invoice view not ready for PDF generation. Composing email without PDF.");
    }

    // Show guide message instead of alert
    if (pdfGenerated) {
      setGuideMessageText("The invoice PDF has been downloaded to your default downloads folder. An email draft will now open; please attach the downloaded PDF to your email.");
      setIsGuideMessageOpen(true);
    }
    
    console.log("[executeEmailAction] Constructing mailto link for", invoiceToEmail.clientEmail);
    const mailtoLink = `mailto:${invoiceToEmail.clientEmail}?subject=Invoice #${invoiceToEmail.id.substring(0,8)} from BarMiConstruction&body=Dear ${invoiceToEmail.clientName},%0D%0A%0D%0APlease find your invoice attached (invoice-${invoiceToEmail.id.substring(0,8)}.pdf).%0D%0A%0D%0AInvoice ID: ${invoiceToEmail.id.substring(0,8)}%0D%0ADue Date: ${invoiceToEmail.paymentDueDate || calculateDueDate(invoiceToEmail.invoiceDate, invoiceToEmail.paymentTerms)}%0D%0ATotal Amount: £${(invoiceToEmail.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(invoiceToEmail.serviceCharge) || 0) + ((invoiceToEmail.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(invoiceToEmail.serviceCharge) || 0)) * (Number(invoiceToEmail.taxRate) || 0))).toFixed(2)}%0D%0A%0D%0AThank you,%0D%0ABarMiConstruction`;
    console.log("[executeEmailAction] Attempting to open mailto link.");
    window.open(mailtoLink, '_blank');
    console.log("[executeEmailAction] mailto link action dispatched.");
  };

  // Extracted logic for actually performing the share action
  const executeShareAction = async (invoiceToShare) => {
    console.log("[executeShareAction] Started for", invoiceToShare.id, "Ref available:", !!invoiceViewRef.current);
    const input = invoiceViewRef.current; // Should be available now
    let pdfFile = null;

    if (input) {
      console.log("[executeShareAction] Attempting to generate PDF for sharing...");
      pdfFile = await generatePDF(invoiceToShare, input, true);
      console.log("[executeShareAction] PDF generation for sharing result:", pdfFile);
    } else {
      console.warn("[executeShareAction] invoiceViewRef.current (input) is null. Cannot generate PDF.");
    }

    if (navigator.share && navigator.canShare) {
     console.log("[executeShareAction] Web Share API is available.");
     const shareData = {
        title: `Invoice #${invoiceToShare.id.substring(0,8)} from BarMiConstruction`,
        text: `Invoice from BarMiConstruction for ${invoiceToShare.clientName}. Due: ${invoiceToShare.paymentDueDate || calculateDueDate(invoiceToShare.invoiceDate, invoiceToShare.paymentTerms)}, Amount: £${(invoiceToShare.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(invoiceToShare.serviceCharge) || 0) + ((invoiceToShare.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(invoiceToShare.serviceCharge) || 0)) * (Number(invoiceToShare.taxRate) || 0))).toFixed(2)}.`,
        // url: window.location.href // Optionally share the URL too
      };

      console.log("[executeShareAction] Checking pdfFile and navigator.canShare for the file. pdfFile:", pdfFile);
      if (pdfFile && navigator.canShare({ files: [pdfFile] })) {
        console.log("[executeShareAction] navigator.canShare({ files: [pdfFile] }) is TRUE. Adding file to shareData.");
        shareData.files = [pdfFile];
      } else if (!pdfFile) {
        console.warn("[executeShareAction] pdfFile is null or undefined. Sharing text only.");
         alert("PDF generation failed or content not ready. Sharing text only.");
      } else if (pdfFile && !navigator.canShare({ files: [pdfFile] })) {
        console.warn("[executeShareAction] pdfFile exists, but navigator.canShare({ files: [pdfFile] }) is FALSE. Sharing text only.");
        alert("Your browser can share, but not this PDF file type/size. Sharing text only.");
      }

      try {
        console.log("[executeShareAction] Attempting navigator.share with data:", JSON.stringify(shareData));
        await navigator.share(shareData);
        console.log("[executeShareAction] navigator.share completed successfully or dialog shown.");
      } catch (error) {
        console.error('[executeShareAction] Error sharing invoice:', error);
        alert(`Sharing failed: ${error.message}`);
      }
    } else {
      console.warn("[executeShareAction] Web Share API not supported or canShare is false.");
      alert('Web Share API (with file sharing) not supported in your browser.');
    }
  };



  const isFormActive = isNew || isEditMode;

  return (
    <>
      {isFormActive ? (
        <div className={`invoice-detail-page new-invoice-form ${isEditMode && !isNew ? 'editing-existing-invoice' : ''} ${isFormClosing ? 'form-panel-closing' : ''}`}>
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete invoice #${formData.id?.substring(0,8)}? This action cannot be undone.`}
          />
          <Header
            title={isNew ? "New Invoice" : (isEditMode ? `Edit #${formData.id?.substring(0,8)}` : "Invoice")}
          />
          <FormErrorMessage message={errorMessage} onClose={() => setErrorMessage('')} />
          <div className="form-content-wrapper">
            <CompanyDetails isNew={isFormActive} formData={formData} handleChange={handleChange} />
            <InvoiceInfo isNew={isFormActive} formData={formData} handleChange={handleChange} />
            <ServicesSection isNew={isFormActive} formData={formData} handleChange={handleChange} />
            <ItemsTable
              isNew={isFormActive}
              items={formData.items}
              handleChange={handleItemChange}
              addItem={addItem}
              deleteItem={deleteItem}
            />
            {isFormActive && (
              <section className="form-section tax-rate-section">
                <div>
                  <label htmlFor="taxRate">Tax Rate (e.g., 0.2 for 20%)</label>
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    step="0.01" min="0" max="1" />
                </div>
              </section>
            )}
            {/* InvoiceTotals is not shown in form mode, calculated on view/save */}
            <Notes formData={formData} handleChange={handleChange} isEditable={isFormActive} />
          </div>
          <Actions
            isNewInvoice={isNew}
            isEditingExisting={isEditMode && !isNew}
            onSaveDraft={handleSaveDraft}
            onSaveAndSend={handleSaveAndSend}
            onDiscard={handleDiscard}
            onCancelEdit={handleCancelEdit}
            onSaveChanges={handleUpdateInvoice}
            currentStatus={formData.status} // Pass status for Save Changes logic
          />
        </div>
      ) : formData && formData.id ? ( // Ensure formData and its ID are loaded for view mode
        <div className="invoice-detail-page invoice-view-container">
           <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete invoice #${formData.id?.substring(0,8)}? This action cannot be undone.`}
          />
          <button onClick={() => navigate('/')} className="go-back-button">
            <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M6.342.886L2.114 5.114l4.228 4.228" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd"/></svg>
            <span>Go back</span>
          </button>
          
          <div className="invoice-view-header">
            <div className="status-info">
              <span>Status</span>
              <div className={`status-badge status-${formData.status}`}>
                <span className="status-dot"></span>
                {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
              </div>
            </div>
            <div className="invoice-view-actions">
              <Actions 
                currentStatus={formData.status} 
                onEdit={() => setIsEditMode(true)} 
                onDelete={handleDeleteInvoice} 
                onMarkAsPaid={handleMarkAsPaid}
                onDownloadPDF={() => handleDownloadPDFInvoice(formData)}
                onPrint={handlePrintInvoice}
                onSendDraft={handleSendDraft}
                onOpenSendOptions={openSendOptionsForExisting}
              />
            </div>
          </div>

          <div className="invoice-view-body" ref={invoiceViewRef}>
            <div className="invoice-view-logo-header">
              <img src={theme === 'light' ? barmilogoDark : barmilogoLight} alt="Barmi Construction Logo" className="invoice-document-logo" />
            </div>
            <div className="invoice-main-info">
              <div className="id-description">
                <h1><span style={{color: '#7E88C3'}}>#</span>{formData.id?.substring(0,8)}</h1>
                <p>{formData.projectDescription}</p>
              </div>
              <CompanyDetails isNew={false} formData={formData} />
            </div>
            <InvoiceInfo isNew={false} formData={formData} />
            <ServicesSection isNew={false} formData={formData} />

            {formData.items && formData.items.length > 0 && (
              <ItemsTable
                isNew={false}
                items={formData.items}
                // serviceCharge={formData.serviceCharge} // Not needed if totals are separate
                // taxRate={formData.taxRate}
              />
            )}
            <InvoiceTotals
              items={formData.items || []}
              serviceCharge={formData.serviceCharge}
              taxRate={formData.taxRate}
            />
            <Notes formData={formData} isEditable={false} />
          </div>
        </div>
      ) : (
        <div>Loading invoice or invoice not found...</div> // Fallback for loading state or error
      )}
      <SendOptionsModal
        isOpen={isSendOptionsModalOpen}
        onClose={handleModalCloseAction}
        invoiceData={invoiceForSendOptions}
        onEmail={handleEmailInvoice}
        onDownloadPDF={handleDownloadPDFInvoice}
        onPrint={handlePrintInvoice}
        onShare={handleShareInvoice}
      />
    {isGuideMessageOpen && (
        <div className="modal-overlay guide-message-overlay">
          <div className="modal-content guide-message-modal">
            <h3>Quick Guide</h3>
            <p>{guideMessageText}</p>
            <button onClick={() => setIsGuideMessageOpen(false)} className="button-primary">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default InvoiceDetailPage;
