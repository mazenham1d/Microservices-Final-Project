const express = require('express');
const router = express.Router();
const inMemoryStore = require('../inMemoryStore');

// POST /log - Log request
router.post('/', async (req, res) => {
  try {
    const { endpoint, method, user, statusCode, responseTime } = req.body;
    
    inMemoryStore.addLog({
      endpoint,
      method,
      user,
      statusCode,
      responseTime
    });
    
    res.status(201).json({ message: 'Log recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

