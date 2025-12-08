const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// GET /stats - Get aggregated statistics
router.get('/', async (req, res) => {
  try {
    const totalRequests = await Log.countDocuments();
    const errorRequests = await Log.countDocuments({ statusCode: { $gte: 400 } });
    const avgResponseTime = await Log.aggregate([
      { $group: { _id: null, avg: { $avg: '$responseTime' } } }
    ]);

    res.json({
      totalRequests,
      errorCount: errorRequests,
      errorRate: totalRequests > 0 ? ((errorRequests / totalRequests) * 100).toFixed(2) : 0,
      avgResponseTime: avgResponseTime[0]?.avg ? avgResponseTime[0].avg.toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /stats/endpoints - Request count by endpoint
router.get('/endpoints', async (req, res) => {
  try {
    const endpointStats = await Log.aggregate([
      {
        $group: {
          _id: { endpoint: '$endpoint', method: '$method' },
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const formatted = endpointStats.map(stat => ({
      endpoint: `${stat._id.method} ${stat._id.endpoint}`,
      count: stat.count,
      avgResponseTime: stat.avgResponseTime.toFixed(2)
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /stats/users - Request count by user
router.get('/users', async (req, res) => {
  try {
    const userStats = await Log.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(userStats.map(stat => ({
      user: stat._id,
      count: stat.count
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /stats/errors - Error rate statistics
router.get('/errors', async (req, res) => {
  try {
    const errorStats = await Log.aggregate([
      {
        $match: { statusCode: { $gte: 400 } }
      },
      {
        $group: {
          _id: '$statusCode',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(errorStats.map(stat => ({
      statusCode: stat._id,
      count: stat.count
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

