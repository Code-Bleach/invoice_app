import './ItemsTable.css'; // For specific styles

function ItemsTable({ isNew, items, handleChange, addItem, deleteItem }) {
  // A helper to format currency robustly
  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '£0.00';
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(num);
  };

  if (isNew) {
    return (
      <section className="items-table form-section">
        <h2>Material</h2>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Qty.</th>
              <th>Price</th>
              <th>Total</th>
              <th></th> {/* For delete button */}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name="name"
                    value={item.name}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Item Name"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="0"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="price"
                    value={item.price}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>{formatCurrency(item.quantity * item.price)}</td>
                <td>
                  <button type="button" onClick={() => deleteItem(index)} className="delete-item-btn">
                    <svg width="13" height="16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.583 3.556v10.666c0 .982-.795 1.778-1.777 1.778H2.694a1.777 1.777 0 01-1.777-1.778V3.556h10.666zM8.473 0l.888.889h3.111v1.778H.028V.889h3.11L4.029 0h4.444z" fill="currentColor" fillRule="nonzero"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addItem} className="add-item-btn">
          + Add New Item
        </button>
      </section>
    );
  }

  // Display mode for existing invoices
  return (
    <section className="items-table-view"> {/* New class for view mode section */}
      <div className="table-container"> {/* Wrapper for styling background and padding */}
        <table className="invoice-items-data-table">
          <thead>
          <tr>
            <th>Material</th>
            <th className="th-qty">QTY.</th>
            <th className="th-price">Price</th>
            <th className="th-total">Total</th>
          </tr>
        </thead>
        <tbody>
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index}>
                <td>{item.name || 'N/A'}</td>
                <td className="td-qty">{Number(item.quantity) || 0}</td>
                <td className="td-price">{formatCurrency(item.price)}</td>
                <td className="td-total">{formatCurrency(item.quantity * item.price)}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No items added.</td></tr>
          )}
        </tbody>
        </table>
      </div>
    </section>
  );
}

export default ItemsTable;