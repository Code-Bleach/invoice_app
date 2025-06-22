// Server //

import express from 'express';
import cors from 'cors';
import { format } from 'date-fns';
import mongoose from 'mongoose';

// --- Database Setup ---
const MONGO_URI = 'mongodb+srv://db_barmi_invoice_app:Bishop1255@cluster0.ymlkqt4.mongodb.net/invoice_app?retryWrites=true&w=majority&appName=Cluster0';


mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Define Schemas ---

// A sub-schema for items within an invoice
const ItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
});

// A detailed and validated schema for your invoices.
// This ensures data integrity.
const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  status: { type: String, required: true, enum: ['paid', 'pending', 'draft'] },
  senderName: String,
  senderStreet: String,
  senderCity: String,
  senderPostCode: String,
  senderCountry: String,
  senderPhone: String,
  senderEmail: String,
  senderWebsite: String,
  clientName: { type: String, required: [true, 'Client name is required'] },
  clientEmail: { type: String, required: [true, 'Client email is required'] },
  clientStreet: String,
  clientCity: String,
  clientPostCode: String,
  clientCountry: String,
  clientPhone: String,
  invoiceDate: { type: Date, required: true },
  paymentTerms: String,
  paymentDueDate: Date,
  projectDescription: String,
  items: [ItemSchema],
  servicesDescription: String,
  serviceCharge: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  notes: String,
  total: Number,
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

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
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// GET all invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find({}).sort({ createdAt: -1 }); // Sort by creation time
        res.json(invoices);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ message: 'Failed to fetch invoices', error });
    }
});

// POST a new invoice
app.post('/api/invoices', async (req, res) => {
    try {
        // The frontend sends 'invoiceNumber'. We map it to 'id' for our schema.
        const invoiceData = { ...req.body, id: req.body.invoiceNumber };
        delete invoiceData.invoiceNumber; // Clean up the object

        // Create a new Mongoose document instance before saving
        const invoiceToSave = new Invoice(invoiceData);
        const savedInvoice = await invoiceToSave.save();
        
        res.status(201).json(savedInvoice);
    } catch (error) {
        console.error("Error creating invoice:", error);
        // Provide a more specific error for duplicate IDs
        if (error.code === 11000) {
             return res.status(409).json({ message: 'Conflict: An invoice with this ID already exists.', error });
        }
        res.status(500).json({ message: 'Failed to create invoice', error });
    }
});

// PUT (update) an invoice
// PUT (update) an invoice
app.put('/api/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedInvoiceData = req.body;
        
        const updatedInvoice = await Invoice.findOneAndUpdate(
            { id: id }, // Find document by our custom 'id' field
            updatedInvoiceData, 
            { new: true, runValidators: true } // Return the updated doc and run schema validators
        );

        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(updatedInvoice);
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ message: 'Failed to update invoice', error });
    }
});

// DELETE an invoice
app.delete('/api/invoices/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await Invoice.deleteOne({ id: id }); // Find by custom 'id'

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(204).send(); // No Content
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ message: 'Failed to delete invoice', error });
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
        console.error("Error generating ID:", error);
        res.status(500).json({ message: 'Failed to generate ID', error });
    }

});


app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
