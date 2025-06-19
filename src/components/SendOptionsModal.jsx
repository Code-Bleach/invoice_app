import React from 'react';
import './SendOptionsModal.css'; // We'll create this CSS file next

function SendOptionsModal({ isOpen, onClose, invoiceData, onEmail, onDownloadPDF, onPrint, onShare }) {
  if (!isOpen) {
    return null;
  }

  // Basic handlers - these will be expanded
  const handleEmail = async () => {
    if (onEmail) await onEmail(invoiceData); // Prop function will handle closing/navigating
    // onClose(); // Modal's own close button will use the onClose prop
  };

  const handleDownloadPDF = async () => {
    if (onDownloadPDF) await onDownloadPDF(invoiceData);
    // onClose();
  };

  const handlePrint = async () => { // Assuming onPrint might become async
    if (onPrint) await onPrint(invoiceData);
    // onClose();
  };

  const handleShare = async () => {
    if (onShare) await onShare(invoiceData);
    // onClose();
  };

  return (
    <div className="modal-overlay send-options-overlay">
      <div className="modal-content send-options-modal">
        <h2>Send or Share Invoice</h2>
        <p>Choose an action for invoice #{invoiceData?.id?.substring(0,8)}:</p>
        <div className="send-options-actions">
          <button onClick={handleEmail} className="button-primary button-icon-text" aria-label="Email Invoice">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button onClick={handleDownloadPDF} className="button-secondary button-icon" aria-label="Download PDF">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button onClick={handlePrint} className="button-secondary button-icon" aria-label="Print Invoice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17H5V11H19V17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 11V7H7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 14H17V20H7V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {navigator.share && ( // Only show share button if Web Share API is supported
            <button onClick={handleShare} className="button-secondary button-icon" aria-label="Share Invoice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.59003 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.41 6.51001L8.59003 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
        <button onClick={onClose} className="button-close-modal">Close</button>
      </div>
    </div>
  );
}

export default SendOptionsModal;