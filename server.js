// Server //

import express from 'express';
import cors from 'cors';
import { format } from 'date-fns';
import mongoose from 'mongoose';

// --- Database Setup ---
// Replace with your MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://db_barmi_invoice_app:db@barmi_invoice.app@cluster0.ymlkqt4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const InvoiceSchema = new mongoose.Schema({}, { strict: false }); // Flexible schema
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., '2025-07'
  seq: { type: Number, default: 0 }
});
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const Counter = mongoose.model('Counter', CounterSchema);

// Helper to get the next sequence for the invoice ID
const getNextSequenceValue = async (sequenceName) => {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Create if doesn't exist
  );
  return sequenceDocument.seq;
};


const app = express();
const PORT = 5001; // We'll run the backend on this port

// Middleware
app.use(cors());
app.use(express.json());

// GET all invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find({}).sort({ invoiceDate: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error reading database', error });
    }
});

// POST a new invoice
app.post('/api/invoices', async (req, res) => {
    try {
        const newInvoice = req.body;
        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Error writing to database', error });
    }
});

// PUT (update) an invoice
app.put('/api/invoices/:invoiceId', async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const updatedInvoiceData = req.body;
        // Use findOneAndUpdate to find by the 'id' field and update
        const updatedInvoice = await Invoice.findOneAndUpdate(
            { id: invoiceId }, 
            updatedInvoiceData, 
            { new: true } // Return the updated document
        );

        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Error updating database', error });
    }
});

// DELETE an invoice
app.delete('/api/invoices/:invoiceId', async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const result = await Invoice.deleteOne({ id: invoiceId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting from database', error });
    }
});

// POST to generate a new invoice ID
app.post('/api/generate-id', async (req, res) => {
    try {
        const now = new Date();
        const month = format(now, 'MM');
        const year = format(now, 'yy');
        const counterKey = format(now, 'yyyy-MM');

        const nextCounter = await getNextSequenceValue(counterKey);
        const paddedCounter = String(nextCounter).padStart(3, '0');
        const newId = `BPC${month}${year}${paddedCounter}`;

        res.json({ id: newId });
    } catch (error) {
        res.status(500).json({ message: 'Error generating ID', error });
    }
});


app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
