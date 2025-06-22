import React from 'react';
import './Notes.css'; // Assuming you have a Notes.css

function Notes({ formData, handleChange, isEditable }) {
  return (
    <section className="notes-section form-section">
      <h2 className="form-section-title">Notes</h2>
      {isEditable ? (
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          placeholder="Add any additional notes or bank details here..."
          rows="5"
        ></textarea>
      ) : (
        <div className="notes-display">
          {formData.notes ? (
            // Display notes, preserving line breaks
            formData.notes.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))
          ) : (
            <p className="no-notes">No additional notes.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default Notes;
