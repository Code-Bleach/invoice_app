import { useMatch, useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { useInvoiceForm } from './hooks/useInvoiceForm';
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
import digitalStamp from './assets/digital-stamp.png'; //digital stamp png


function InvoiceDetailPage({ addInvoice, invoices, updateInvoice, deleteInvoice, markInvoiceAsPaid, theme }) {
  const isNewInvoiceRoute = useMatch("/invoice/new");
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId } = useParams();

  const existingInvoice = invoiceId && invoices ? invoices.find(inv => inv.id === invoiceId) : null;
  const { formData, setFormData, errorMessage, setErrorMessage, validateForm, handleChange, handleItemChange, addItem, deleteItem } = useInvoiceForm(existingInvoice);

  const isNew = !invoiceId && !!isNewInvoiceRoute;
  const [isEditMode, setIsEditMode] = useState(isNew); // Start in edit mode if new
  const [originalInvoiceData, setOriginalInvoiceData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormClosing, setIsFormClosing] = useState(false);
  const [isSendOptionsModalOpen, setIsSendOptionsModalOpen] = useState(false);
  const [invoiceForSendOptions, setInvoiceForSendOptions] = useState(null);
  const [isGuideMessageOpen, setIsGuideMessageOpen] = useState(false);
  const [guideMessageText, setGuideMessageText] = useState('');
  const [dontShowEmailGuideAgain, setDontShowEmailGuideAgain] = useState(() => localStorage.getItem('dontShowEmailGuide') === 'true');
  const [currentMailtoLink, setCurrentMailtoLink] = useState(''); // To store the mailto link
  const invoiceViewRef = useRef(null);

  const ANIMATION_DURATION = 400;

  useEffect(() => {
    console.log('[InvoiceDetailPage useEffect] Running. invoiceId:', invoiceId, 'isNew:', isNew, 'location.state:', location.state);

    if (invoiceId && invoices) {
      if (existingInvoice) {
        setOriginalInvoiceData(existingInvoice);
        setIsEditMode(false); // Start in view mode for existing invoices

        console.log('[InvoiceDetailPage useEffect] Checking for showSendOptions. location.state:', location.state, 'existingInvoice.id:', existingInvoice.id, 'invoiceId:', invoiceId);
        // Handle opening send options modal if requested by navigation state
        if (location.state?.showSendOptions && existingInvoice.id === invoiceId) {
          console.log('[InvoiceDetailPage useEffect] showSendOptions condition met. Opening modal.');
          setInvoiceForSendOptions(existingInvoice);
          setIsSendOptionsModalOpen(true);
          navigate(location.pathname, { replace: true, state: {} });
        }

          console.log('[InvoiceDetailPage useEffect] Checking for triggerAction. location.state:', location.state, 'existingInvoice.id:', existingInvoice.id, 'invoiceId:', invoiceId);
        // Handle triggering email/share action if requested by navigation state
        if (location.state?.triggerAction && existingInvoice.id === invoiceId) {
         
        //   // Clear the triggerAction from state after processing
        //   navigate(location.pathname, { replace: true, state: {} });
            const actionToTrigger = location.state.triggerAction;
             console.log('[InvoiceDetailPage useEffect] triggerAction condition met. Action:', actionToTrigger);
             const dataForAction = { ...existingInvoice }; // Capture data to avoid issues with stale closures
          // Clear the triggerAction from state immediately so it doesn't re-trigger
          // navigate(location.pathname, { replace: true, state: {} }); 
         
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
      setIsEditMode(true); // New invoices start in edit mode
    }
  }, [invoiceId, invoices, isNew, navigate, location.state]);


    // Function to generate a new unique invoice ID
  // This function is now async because it interacts with the backend API
  const generateNewInvoiceId = async () => {
    
    try {
      const response = await fetch('/api/generate-id', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to generate ID from server');
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error generating sequential invoice ID:", error);
    // Fallback to a less ideal, client-side unique ID if server fails
      return `ERR-${Date.now()}`;
    }
  };

  // Ensure closeFormAndNavigate is defined to accept and use navigationState
const closeFormAndNavigate = (path = '/', navigationState = {}) => { // Ensure navigationState is a parameter
  setIsFormClosing(true);
  setTimeout(() => {
    setIsEditMode(false);
    setIsFormClosing(false);
    // setFormData(initialFormData); // Resetting is now handled by the hook based on `existingInvoice`
    navigate(path, navigationState); // Pass the state here
  }, ANIMATION_DURATION);

};
 // Make sure this function is correctly passing navigationState if it's used elsewhere with state


  const handleSaveDraft = async () => { // Mark as async
    if (!validateForm()) return;

    // "Save as Draft" is intended for creating a new draft from the current form.
    // It should not update an existing invoice. "Save Changes" handles updates.
    // The `isNew` flag (derived from the route) is the most reliable indicator.
    if (!isNew && formData.id) {
      console.warn("handleSaveDraft called unexpectedly for an existing, non-new invoice. Use 'Save Changes' to update.");
      // To prevent accidental creation of a new draft from an existing invoice's edit form,
      // if onSaveDraft is only wired for new invoices.
      // If the intention IS to "Save a Copy as Draft", this logic would be different.
    }

    const newId = await generateNewInvoiceId();
    const draftInvoiceData = { ...formData, status: 'draft', id: newId };
    const newDraft = await addInvoice(draftInvoiceData); // addInvoice from App.jsx

    if (newDraft && newDraft.id) {
      closeFormAndNavigate(`/invoice/${newDraft.id}`);
    } else {
      console.error("Failed to save draft: addInvoice did not return the expected new draft object with an ID.");
      setErrorMessage("There was an error saving the draft. Please try again.");
    }
  };

  const handleSaveAndSend = async () => { // For new invoices
    // This function needs to be async because finalizeAndSaveAsPending is now async
    if (!validateForm()) return;
   // For new invoices, just open the modal. The form remains.
    // The decision to save as draft/pending and navigate happens based on modal action.
    setInvoiceForSendOptions({ ...formData }); // Pass current form data to the modal
    // The actual saving (and ID generation if new) happens when an action is chosen in the modal
    setIsSendOptionsModalOpen(true);
  };
  
  const handleSendDraft = async () => { // For existing drafts
    if (formData.id && formData.status === 'draft') {
      setInvoiceForSendOptions({ ...formData });
      setIsSendOptionsModalOpen(true);
    }
  };

  const handleUpdateInvoice = async() => { // "Save Changes" when editing an existing draft
    if (!validateForm()) return;
    const updatedData = { ...formData, status: 'draft' }; // Saving changes keeps it as draft
    await updateInvoice(updatedData);
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
      setFormData(originalInvoiceData);
      setIsEditMode(false);
      setIsFormClosing(false);
    }, ANIMATION_DURATION);
  };

  const handleDeleteInvoice = () => setIsDeleteModalOpen(true);
  const confirmDelete = async () => {
    await deleteInvoice(formData.id);
    setIsDeleteModalOpen(false);
    navigate('/');
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleMarkAsPaid = async () => {
    await markInvoiceAsPaid(formData.id);
    setFormData(prev => ({ ...prev, status: 'paid'}));
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
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      if (forSharing) {
        const pdfBlob = pdf.output('blob');
        return new File([pdfBlob], `invoice-${invoice.id || 'new'}.pdf`, { type: 'application/pdf' });
      } else {
        pdf.save(`invoice-${invoice.id || 'new'}.pdf`); // This is standard
        return true;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  // This function now handles saving/updating the invoice to 'pending' status
  // It's called by handleEmailInvoice and handleShareInvoice
  const finalizeAndSaveAsPending = async (invoiceDataToSave) => { // Mark as async
     const finalInvoice = {
      ...invoiceDataToSave,
      status: 'pending',
      // Only generate a new ID if one doesn't exist (for new invoices from the modal)
      id: invoiceDataToSave.id || await generateNewInvoiceId() // Await the async ID generation
    };
    // Check if this is a new invoice being saved for the first time as pending
    if (!invoiceDataToSave.id) { // This implies it came from the new invoice form via modal
      const newlyAddedInvoice = await addInvoice(finalInvoice);
      setFormData(newlyAddedInvoice); // Update local state with the full new invoice
      return newlyAddedInvoice;
    } else { // It was an existing draft
      await updateInvoice(finalInvoice);
      setFormData(finalInvoice); // Update local state
      return finalInvoice;
    }
  };

  const handleEmailInvoice = async (invoiceDataFromModal) => {
    // If invoiceDataFromModal has no ID, it's from a new invoice form.
    // Otherwise, it's an existing draft being sent.
    const wasNewInvoiceFlow = !invoiceDataFromModal.id;
    const finalPendingInvoice = await finalizeAndSaveAsPending(invoiceDataFromModal);

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
    const finalPendingInvoice = await finalizeAndSaveAsPending(invoiceDataFromModal); // Await saving as pending
     // This needs to be awaited too: const finalPendingInvoice = await finalizeAndSaveAsPending(invoiceDataFromModal);

    if (wasNewInvoiceFlow) {
      // Form closes, navigates to view the new pending invoice.
      // closeFormAndNavigate(`/invoice/${finalPendingInvoice.id}`); 
      setIsSendOptionsModalOpen(false); // Close modal before navigating
      // Pass a state to trigger the share action after navigation.
      setIsSendOptionsModalOpen(false); // Close modal before navigating
      closeFormAndNavigate(`/invoice/${finalPendingInvoice.id}`, { state: { triggerAction: 'share' } });
    } else {
      // For existing invoices, execute directly
      await executeShareAction(finalPendingInvoice);
      setIsSendOptionsModalOpen(false);
    }
  };

   const handleModalCloseAction = async () => {
    // This is called when the modal's "Close" button is clicked.
    // If invoiceForSendOptions has no ID, it means it was from the "Save & Send" of a new invoice.
    // In this case, save as draft and navigate.
    if (invoiceForSendOptions && !invoiceForSendOptions.id && isNew) {
     const draftInvoice = { ...invoiceForSendOptions, status: 'draft', id: await generateNewInvoiceId() }; // Await ID generation
     const newDraft = await addInvoice(draftInvoice);
      setIsSendOptionsModalOpen(false); // Close the modal
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

    if (input) { //If view is rendered
      pdfGenerated = await generatePDF(invoiceToEmail, input);
    } else {
      alert("Invoice view not ready for PDF generation. Composing email without PDF.");
    }

    // Define mailtoLink at the beginning of the function scope
    const mailtoLink = `mailto:${invoiceToEmail.clientEmail}?subject=Invoice %20%23${invoiceToEmail.id}%20from%20BarMiConstruction&body=Dear%20${invoiceToEmail.clientName},%0D%0A%0D%0APlease%20find%20your%20invoice%20attached%20(invoice-${invoiceToEmail.id}.pdf).%0D%0A%0D%0AInvoice%20ID:%20${invoiceToEmail.id}%0D%0ADue%20Date:%20${invoiceToEmail.paymentDueDate || calculateDueDate(invoiceToEmail.invoiceDate, invoiceToEmail.paymentTerms)}%0D%0ATotal%20Amount:%20£${(invoiceToEmail.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(invoiceToEmail.serviceCharge) || 0) + ((invoiceToEmail.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) + (Number(invoiceToEmail.serviceCharge) || 0)) * (Number(invoiceToEmail.taxRate) || 0))).toFixed(2)}%0D%0A%0D%0AThank%20you,%0D%0ABarMiConstruction`;

    setCurrentMailtoLink(mailtoLink); // Store the link

    // Show guide message instead of alert
    if (pdfGenerated) {
      if (dontShowEmailGuideAgain) {
        console.log("[executeEmailAction] 'Don't show guide' is true. Opening mailto link directly.");
        window.open(mailtoLink); // Removed _blank
        console.log("[executeEmailAction] mailto link action dispatched directly.");
      } else {
        setGuideMessageText("The invoice PDF has been downloaded to your default downloads folder. An email draft will open after you click 'Got it'; please attach the downloaded PDF to your email.");
        setIsGuideMessageOpen(true);
      }
    } else { // If PDF not generated, open mailto link directly
      console.log("[executeEmailAction] PDF not generated. Opening mailto link directly.");
      window.open(mailtoLink); // Removed _blank
      console.log("[executeEmailAction] mailto link action dispatched directly (no PDF).");
    }
 };

  // Extracted logic for actually performing the share action
  const executeShareAction = async (invoiceToShare) => {
    console.log("[executeShareAction] Started for", invoiceToShare.id, "Ref available:", !!invoiceViewRef.current); // invoiceToShare might not have ID yet if new
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
        title: `Invoice #${invoiceToShare.id} from BarMiConstruction`,
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
            message={`Are you sure you want to delete invoice#: ${formData.id}? This action cannot be undone.`}
          />

          <Header
             title={isNew ? "New Invoice" : (isEditMode ? `Edit #${formData.id}` : "Invoice")}
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
            message={`Are you sure you want to delete invoice#: ${formData.id}? This action cannot be undone.`}
          />

          <div className="invoice-view-header">
            <div className="status-info">
              <button onClick={() => navigate('/')} className="go-back-button">
                <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M6.342.886L2.114 5.114l4.228 4.228" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd"/></svg>
                <span>Go back</span>
              </button>
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
                onEmail={() => executeEmailAction(formData)}
                onShare={() => executeShareAction(formData)}
              />
            </div>
          </div>

          <div className="invoice-view-body" ref={invoiceViewRef}>
            <div className="invoice-view-logo-header">
              <img src={theme === 'light' ? barmilogoDark : barmilogoLight} alt="Barmi Construction Logo" className="invoice-document-logo" />
            </div>
            <div className="invoice-main-info">
              <div className="id-description">
                <h1><span style={{color: '#7E88C3'}}>Invoice#: </span>{formData.id}</h1>
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
              />
            )}
            <InvoiceTotals
              items={formData.items || []}
              serviceCharge={formData.serviceCharge}
              taxRate={formData.taxRate}
            />
            <Notes formData={formData} isEditable={false} />
            <div className="digital-stamp-container">
              <img src={digitalStamp} alt="Company Stamp" className="digital-stamp" />
            </div>
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
          <div className="guide-options">
            <label htmlFor="dontShowAgainCheckbox">
              <input
                type="checkbox"
                id="dontShowAgainCheckbox"
                checked={dontShowEmailGuideAgain}
                onChange={(e) => setDontShowEmailGuideAgain(e.target.checked)}
              />
              Don't show this again
            </label>
          </div>
          <button
            onClick={() => {
              setIsGuideMessageOpen(false);
              if (dontShowEmailGuideAgain) localStorage.setItem('dontShowEmailGuide', 'true'); else localStorage.removeItem('dontShowEmailGuide');
             if (currentMailtoLink) window.open(currentMailtoLink); console.log("[GuideMessage] mailto link action dispatched from guide."); // Removed _blank
            }} className="button-primary">
              Got it
            </button>
          </div>
          
      </div>
      )}
    </>
  );
}

export default InvoiceDetailPage;
