import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './InvoiceListHeader.css'; // For specific styles

function InvoiceListHeader({ invoiceCount = 0, filters, onFilterChange }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for the dropdown container

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleCheckboxChange = (event) => {
    onFilterChange(event); // Call the parent's handler
    // setIsDropdownOpen(false); // Removed: Dropdown no longer closes on selection
  };

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the dropdownRef and not on the filter button itself
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !event.target.closest('.filter-button')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="invoice-list-header">
      <div>
        <h1>Invoices</h1>
        <p>There are {invoiceCount} total invoices</p>
      </div>
      <div className="filter-container">
        <button onClick={toggleDropdown} className="filter-button" aria-expanded={isDropdownOpen} aria-controls="filter-options">
          Filter by status
          <svg width="11" height="7" xmlns="http://www.w3.org/2000/svg" className={`arrow-icon ${isDropdownOpen ? 'open' : ''}`}><path d="M1 1l4.228 4.228L9.456 1" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd"/></svg>
        </button>
        <ul id="filter-options" ref={dropdownRef} className={`filter-dropdown ${isDropdownOpen ? 'open' : ''}`} role="listbox">
          <li>
            <label htmlFor="draft">
              <input
                type="checkbox"
                id="draft"
                name="draft"
                checked={filters.draft}
                onChange={handleCheckboxChange}
              />
              Draft
            </label>
          </li>
          <li>
            <label htmlFor="pending">
              <input
                type="checkbox"
                id="pending"
                name="pending"
                checked={filters.pending}
                onChange={handleCheckboxChange}
              />
              Pending
            </label>
          </li>
          <li>
            <label htmlFor="paid">
              <input
                type="checkbox"
                id="paid"
                name="paid"
                checked={filters.paid}
                onChange={handleCheckboxChange}
              />
              Paid
            </label>
          </li>
        </ul>
      </div>
      <Link to="/invoice/new">
        <button>New Invoice</button>
      </Link>
    </header>
  );
}

export default InvoiceListHeader;