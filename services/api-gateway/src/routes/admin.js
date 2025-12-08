const express = require('express');
const router = express.Router();
const axios = require('axios');

const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3002';

// GET /api/admin/analytics - Get usage statistics (admin only)
router.get('/analytics', async (req, res) => {
  try {
    const [stats, endpoints, users, errors] = await Promise.all([
      axios.get(`${ANALYTICS_SERVICE_URL}/stats`),
      axios.get(`${ANALYTICS_SERVICE_URL}/stats/endpoints`),
      axios.get(`${ANALYTICS_SERVICE_URL}/stats/users`),
      axios.get(`${ANALYTICS_SERVICE_URL}/stats/errors`)
    ]);

    res.json({
      overview: stats.data,
      endpoints: endpoints.data,
      users: users.data,
      errors: errors.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

