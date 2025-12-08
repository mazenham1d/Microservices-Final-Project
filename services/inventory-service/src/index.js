require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'inventory-service' });
});

// Routes
app.use('/items', itemsRouter);

// Connect to database
connectDB();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Inventory Service running on port ${PORT}`);
});

