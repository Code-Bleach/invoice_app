import './Header.css';

function Header({ title = "INVOICE", invoiceNumber }) {
  return (
    <header className="invoice-header">
      <h1>{title}</h1>
      {invoiceNumber && <div>Invoice # {invoiceNumber}</div>}
    </header>
  );
}

export default Header;