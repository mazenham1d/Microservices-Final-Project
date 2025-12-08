const express = require('express');
const router = express.Router();
const { getUserFromAuth } = require('../middleware/auth');

// POST /api/auth/login - User authentication (Basic Auth handled by middleware)
router.post('/login', (req, res) => {
  const user = getUserFromAuth(req);
  if (user) {
    res.json({
      message: 'Login successful',
      user: {
        username: user.username,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;

