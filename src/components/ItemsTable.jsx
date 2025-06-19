import './ItemsTable.css'; // For specific styles
import InvoiceTotals from './InvoiceTotals'; // Import for view mode

function ItemsTable({ isNew, items, handleChange, addItem, deleteItem, serviceCharge, taxRate }) { // Added serviceCharge and taxRate
  if (isNew) {
    return (
      <section className="items-table form-section">
        <h2>Item List</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
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
                    onChange={(e) => handleChange(e, index)}
                    placeholder="Item Name"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="0"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="price"
                    value={item.price}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>{(item.quantity * item.price).toFixed(2)}</td>
                <td>
                  <button type="button" onClick={() => deleteItem(index)} className="delete-item-btn">
                    {/* Replace with an actual icon later */}
                    🗑️ 
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
            <th>Description</th>
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
                <td className="td-qty">{item.quantity || 0}</td>
                <td className="td-price">&pound;{(item.price || 0).toFixed(2)}</td>
                <td className="td-total">&pound;{(item.quantity * item.price || 0).toFixed(2)}</td>
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