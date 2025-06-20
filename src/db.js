const DB_NAME = 'InvoiceAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'invoices';

let db;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = event.target.result;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Optional: Create indexes for searching/sorting
        // objectStore.createIndex('status', 'status', { unique: false });
        // objectStore.createIndex('clientName', 'clientName', { unique: false });
        console.log(`Object store "${STORE_NAME}" created.`);
      }
    };
  });
};

export const addInvoiceDB = (invoice) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB(); // Ensure DB is initialized
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(invoice);

    request.onsuccess = () => resolve(invoice); // Return the added invoice
    request.onerror = (event) => {
      console.error('Error adding invoice:', event.target.error);
      reject('Error adding invoice');
    };
  });
};

export const getAllInvoicesDB = () => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => resolve(event.target.result || []);
    request.onerror = (event) => {
      console.error('Error getting all invoices:', event.target.error);
      reject('Error getting all invoices');
    };
  });
};

export const updateInvoiceDB = (invoice) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(invoice); // put() updates if exists, adds if not

    request.onsuccess = () => resolve(invoice); // Return the updated invoice
    request.onerror = (event) => {
      console.error('Error updating invoice:', event.target.error);
      reject('Error updating invoice');
    };
  });
};

export const deleteInvoiceDB = (invoiceId) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(invoiceId);

    request.onsuccess = () => resolve(invoiceId);
    request.onerror = (event) => {
      console.error('Error deleting invoice:', event.target.error);
      reject('Error deleting invoice');
    };
  });
};

// Example of getting a single invoice by ID (if needed)
export const getInvoiceByIdDB = (invoiceId) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(invoiceId);

    request.onsuccess = (event) => {
      resolve(event.target.result); // Returns the invoice or undefined
    };
    request.onerror = (event) => {
      console.error('Error getting invoice by ID:', event.target.error);
      reject('Error getting invoice by ID');
    };
  });
};
