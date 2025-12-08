require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authMiddleware, requireAdmin } = require('./middleware/auth');
const analyticsMiddleware = require('./middleware/analytics');
const pantryRouter = require('./routes/pantry');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway' });
});

// Auth routes
app.use('/api/auth', authMiddleware, authRouter);

// All other routes require authentication
app.use(authMiddleware);
app.use(analyticsMiddleware);

// Pantry routes
app.use('/api/pantry', pantryRouter);

// Admin routes (require admin role)
app.use('/api/admin', requireAdmin, adminRouter);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
});

