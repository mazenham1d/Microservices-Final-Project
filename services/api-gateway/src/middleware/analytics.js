const axios = require('axios');

const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3002';

const logRequest = async (endpoint, method, user, statusCode, responseTime) => {
  try {
    await axios.post(`${ANALYTICS_SERVICE_URL}/log`, {
      endpoint,
      method,
      user,
      statusCode,
      responseTime
    }, { timeout: 1000 });
  } catch (error) {
    // Don't fail the request if analytics logging fails
    console.error('Failed to log to analytics service:', error.message);
  }
};

const analyticsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const user = req.auth?.user || 'anonymous';
  
  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    logRequest(req.path, req.method, user, res.statusCode, responseTime);
    return originalJson(data);
  };
  
  // Handle errors
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    if (res.statusCode >= 400) {
      logRequest(req.path, req.method, user, res.statusCode, responseTime);
    }
  });
  
  next();
};

module.exports = analyticsMiddleware;

