require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const logRouter = require('./routes/log');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'analytics-service' });
});

// Routes
app.use('/log', logRouter);
app.use('/stats', statsRouter);

// Connect to database
connectDB();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Analytics Service running on port ${PORT}`);
});

