const DB_NAME = 'InvoiceAppDB';
const DB_VERSION = 2; // Increment version to add new object store
const STORE_NAME = 'invoices';
const COUNTERS_STORE_NAME = 'counters'; // New store for counters

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
        tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Optional: Create indexes for searching/sorting
        // objectStore.createIndex('status', 'status', { unique: false });
        // objectStore.createIndex('clientName', 'clientName', { unique: false });
        }
      // Create the new counters object store in version 2
      if (!tempDb.objectStoreNames.contains(COUNTERS_STORE_NAME)) {
        tempDb.createObjectStore(COUNTERS_STORE_NAME, { keyPath: 'key' }); // Key will be 'YYYY-MM'
        console.log(`Object store "${STORE_NAME}" created.`);
      }
    };
  });
};

// Functions to manage counters

export const getCounterDB = (key) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([COUNTERS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(COUNTERS_STORE_NAME);
    const request = store.get(key);

    request.onsuccess = (event) => {
      // Return the counter value or 0 if not found
      resolve(event.target.result ? event.target.result.value : 0);
    };
    request.onerror = (event) => {
      console.error('Error getting counter:', event.target.error);
      reject('Error getting counter');
    };
  });
};

export const setCounterDB = (key, value) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();
    const transaction = db.transaction([COUNTERS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(COUNTERS_STORE_NAME);
    const request = store.put({ key, value }); // Store as { key: 'YYYY-MM', value: N }

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject('Error setting counter');
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
