const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// POST /log - Log request
router.post('/', async (req, res) => {
  try {
    const { endpoint, method, user, statusCode, responseTime } = req.body;
    
    const log = new Log({
      endpoint,
      method,
      user,
      statusCode,
      responseTime,
      timestamp: new Date()
    });

    await log.save();
    res.status(201).json({ message: 'Log recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

