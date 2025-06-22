import React from 'react';
import './Notes.css'; // Assuming you have a Notes.css

function Notes({ formData }) {
  return (
    <section className="notes-section form-section">
      <h2 className="form-section-title">Notes</h2>
      <div className="notes-display">
        {formData.notes ? (
          // Display notes, preserving line breaks
          formData.notes.split('\n').map((line, index) => (
            <p key={index}>{line || '\u00A0'}</p> // Use a non-breaking space for empty lines
          ))
        ) : (
          <p className="no-notes">No additional notes.</p>
        )}
      </div>
    </section>
  );
}

export default Notes;
