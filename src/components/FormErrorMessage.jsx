import React, { useState, useEffect } from 'react';
import './FormErrorMessage.css';

function FormErrorMessage({ message, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const ANIMATION_DURATION = 300; // ms, should match CSS animation

  const handleClose = () => {
    if (onClose) {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false); // Reset for next time it might appear
      }, ANIMATION_DURATION);
    }
  };

  if (!message) {
    return null;
  }

  return (
    <div className={`form-error-message ${isClosing ? 'form-error-message-closing' : ''}`}>
      <p>{message}</p>
      {onClose && (
        <button onClick={handleClose} className="close-error-btn">&times;</button>
      )}
    </div>
  );
}

export default FormErrorMessage;