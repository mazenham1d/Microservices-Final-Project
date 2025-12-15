const mongoose = require('mongoose');

const connectDB = async () => {
  // Skip DB connection if no MONGODB_URI is provided (for demo mode)
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not configured - running without database (in-memory mode)');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Continuing without database connection (in-memory mode)');
  }
};

module.exports = connectDB;

