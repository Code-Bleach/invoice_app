import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './InvoiceListHeader.css'; // For specific styles

function InvoiceListHeader({ invoiceCount, activeFilters, onFilterChange }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  
    }, []);

  let titleText = 'No invoices';
  if (invoiceCount > 0) {
    titleText = `There are ${invoiceCount} total invoices`;
    if (activeFilters.length > 0) {
      titleText = `There are ${invoiceCount} ${activeFilters.join(' & ')} invoices`;
    }
  } else if (activeFilters.length > 0) {
    titleText = `No ${activeFilters.join(' & ')} invoices found`;
  }

  return (
    <header className="invoice-list-header">
      <div className="header-text">
        <h1>Invoices</h1>
        <p>{titleText}</p>
      </div>
      {/* The actions are now direct children of the header to match the original CSS selectors */}
      <div className="filter-container" ref={filterRef}>
        <button className="filter-button" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            Filter by status
            <svg width="11" height="7" xmlns="http://www.w3.org/2000/svg" className={`arrow-icon ${isFilterOpen ? 'open' : ''}`}>
              <path d="M1 1l4.228 4.228L9.456 1" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd"/>
            </svg>
          </button>
          {/* This structure matches the original CSS which uses a <ul> for the dropdown */}
        <ul id="filter-options" className={`filter-dropdown ${isFilterOpen ? 'open' : ''}`} role="listbox">
          <li>
            <label htmlFor="draft">
              <input
                type="checkbox"
                id="draft"
                name="draft"
                checked={activeFilters.includes('draft')}
                onChange={onFilterChange}
              />
              Draft
            </label>
          </li>
          <li>
            <label htmlFor="pending">
              <input type="checkbox" id="pending" name="pending" checked={activeFilters.includes('pending')} onChange={onFilterChange} />
              Pending
            </label>
          </li>
          <li>
            <label htmlFor="paid">
              <input type="checkbox" id="paid" name="paid" checked={activeFilters.includes('paid')} onChange={onFilterChange} />
              Paid
            </label>
          </li>
        </ul>
      </div>
      {/* This structure matches the original CSS selector: .invoice-list-header > a > button */}
      <Link to="/invoice/new">
        <button>New Invoice</button>
      </Link>
    </header>
  );
}

export default InvoiceListHeader;