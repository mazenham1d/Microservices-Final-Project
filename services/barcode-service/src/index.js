require('dotenv').config();
const express = require('express');
const cors = require('cors');
const scanRouter = require('./routes/scan');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'barcode-service' });
});

// Routes
app.use('/', scanRouter);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Barcode Service running on port ${PORT}`);
});

