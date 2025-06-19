import React from 'react';
import './ConfirmationModal.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title || 'Confirm Action'}</h2>
        <p>{message || 'Are you sure?'}</p>
        <div className="modal-actions">
          <button onClick={onClose} className="button-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="button-danger">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;