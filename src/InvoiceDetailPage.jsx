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
    if (invoiceId && invoices) {
      const existingInvoice = invoices.find(inv => inv.id === invoiceId);
      if (existingInvoice) {
        const dueDate = existingInvoice.paymentDueDate || calculateDueDate(existingInvoice.invoiceDate, existingInvoice.paymentTerms);
        const notes = existingInvoice.notes || generateNotesWithDueDate(dueDate, existingInvoice.notes?.split('\n')[0] || "Thank you for your business!");
        const fullExistingData = { ...initialFormData, ...existingInvoice, paymentDueDate: dueDate, notes: notes };
        setFormData(fullExistingData);
        setOriginalInvoiceData(fullExistingData);
        setIsEditMode(false); // Start in view mode for existing invoices

        if (location.state?.showSendOptions && existingInvoice.id === invoiceId) {
          setInvoiceForSendOptions(fullExistingData);
          setIsSendOptionsModalOpen(true);
          navigate(location.pathname, { replace: true, state: {} });
        }
      } else {
        console.error("Invoice not found:", invoiceId);
        navigate('/');
      }
    } else if (isNew) {
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

  const closeFormAndNavigate = (path = '/') => {
    setIsFormClosing(true);
    setTimeout(() => {
      setIsEditMode(false);
      setIsFormClosing(false);
      setFormData(initialFormData); // Reset form for next time
      navigate(path);
    }, ANIMATION_DURATION);
  };

  const handleSaveDraft = () => {
    if (!validateForm()) return;
    const draftInvoice = { ...formData, status: 'draft', id: formData.id || `INV-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` };
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
    setInvoiceForSendOptions({ ...formData }); // No ID or status change yet
    setIsSendOptionsModalOpen(true);
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
        pdf.save(`invoice-${invoice.id?.substring(0,8) || 'new'}.pdf`);
        return true;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  const finalizeAndSaveAsPending = (invoiceDataFromModal) => {
    const finalInvoice = {
      ...invoiceDataFromModal,
      status: 'pending',
      id: invoiceDataFromModal.id || `INV-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
    };
    if (isNew || !invoiceDataFromModal.id) { // If it was a new form or a draft without a persistent ID
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
    const finalPendingInvoice = finalizeAndSaveAsPending(invoiceDataFromModal);
    const input = invoiceViewRef.current; // This will be null if called from new invoice form
    let pdfGenerated = false;

    if (input) { // If view is rendered (i.e., modal opened from view mode)
      pdfGenerated = await generatePDF(finalPendingInvoice, input);
    } else { // If modal opened from new invoice form
      alert("Compose your email. The invoice is now pending. PDF can be downloaded/attached after viewing it.");
    }

    if (pdfGenerated) {
      alert("The invoice PDF has been downloaded. Please find the email draft that will open and attach the PDF.");
    }
    
    const mailtoLink = `mailto:${finalPendingInvoice.clientEmail}?subject=Invoice #${finalPendingInvoice.id.substring(0,8)} from BarMiConstruction&body=Dear ${finalPendingInvoice.clientName},%0D%0A%0D%0APlease find your invoice attached (invoice-${finalPendingInvoice.id.substring(0,8)}.pdf).%0D%0A%0D%0AInvoice ID: ${finalPendingInvoice.id.substring(0,8)}%0D%0ADue Date: ${finalPendingInvoice.paymentDueDate || calculateDueDate(finalPendingInvoice.invoiceDate, finalPendingInvoice.paymentTerms)}%0D%0ATotal Amount: £${(finalPendingInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(finalPendingInvoice.serviceCharge) || 0) + ((finalPendingInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(finalPendingInvoice.serviceCharge) || 0)) * (Number(finalPendingInvoice.taxRate) || 0))).toFixed(2)}%0D%0A%0D%0AThank you,%0D%0ABarMiConstruction`;
    window.open(mailtoLink, '_blank');

    if (isNew) {
      closeFormAndNavigate(`/invoice/${finalPendingInvoice.id}`); // Navigate to view the new pending invoice
    } else {
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
    const finalPendingInvoice = finalizeAndSaveAsPending(invoiceDataFromModal);
    const input = invoiceViewRef.current; // Will be null if called from new invoice form
    let pdfFile = null;

    if (input) { // If view is rendered
      pdfFile = await generatePDF(finalPendingInvoice, input, true);
    }

    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: `Invoice #${finalPendingInvoice.id.substring(0,8)} from BarMiConstruction`,
        text: `Invoice from BarMiConstruction for ${finalPendingInvoice.clientName}. Due: ${finalPendingInvoice.paymentDueDate || calculateDueDate(finalPendingInvoice.invoiceDate, finalPendingInvoice.paymentTerms)}, Amount: £${(finalPendingInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(finalPendingInvoice.serviceCharge) || 0) + ((finalPendingInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(finalPendingInvoice.serviceCharge) || 0)) * (Number(finalPendingInvoice.taxRate) || 0))).toFixed(2)}.`,
      };
      if (pdfFile && navigator.canShare({ files: [pdfFile] })) {
        shareData.files = [pdfFile];
      } else if (!pdfFile && isNew) {
         alert("Invoice will be shared as text. PDF can be shared after viewing the saved invoice.");
      } else if (!pdfFile && !isNew) {
         alert("PDF generation failed. Sharing text only.");
      }

      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing invoice:', error);
      }
    } else {
      alert('Web Share API (with file sharing) not supported in your browser.');
    }

    if (isNew) {
      closeFormAndNavigate(`/invoice/${finalPendingInvoice.id}`);
    } else {
      setIsSendOptionsModalOpen(false);
    }
  };

  const handleModalCloseAction = () => {
    if (isNew && invoiceForSendOptions) {
      const draftInvoice = { ...invoiceForSendOptions, status: 'draft', id: `INV-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` };
      const newDraft = addInvoice(draftInvoice);
      closeFormAndNavigate(`/invoice/${newDraft.id}`); // Navigate to view the new draft
    } else {
      setIsSendOptionsModalOpen(false); // Just close if it was an existing invoice
    }
  };

  const openSendOptionsForExisting = () => {
    setInvoiceForSendOptions(formData);
    setIsSendOptionsModalOpen(true);
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
    </>
  );
}

export default InvoiceDetailPage;
