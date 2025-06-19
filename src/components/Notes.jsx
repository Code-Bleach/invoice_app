// import './Notes.css'; // For specific styles

function Notes({ formData, handleChange, isEditable }) {
  // Provide a default for notes if formData.notes is undefined
  const notesValue = formData?.notes === undefined ? "Thank you for choosing BarMiConstruction!" : formData.notes;

  if (isEditable) {
    return (
      <section className="notes-section form-section">
        <h2>Notes</h2>
        <textarea 
          name="notes" 
          value={notesValue} 
          onChange={handleChange} 
          rows="3"
          placeholder="Add any notes or payment terms here..."
        />
      </section>
    );
  }
  return (
    <section className="notes-section">
      {/* <h2>Notes:</h2> */}
      <pre>{notesValue}</pre> {/* Use <pre> to respect newlines */}
    </section>
  );
}

export default Notes;