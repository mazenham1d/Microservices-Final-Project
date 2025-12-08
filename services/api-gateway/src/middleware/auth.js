const basicAuth = require('express-basic-auth');

// Demo users - in production, use proper authentication
const users = {
  admin: { password: 'admin123', role: 'admin' },
  user: { password: 'user123', role: 'user' }
};

const authMiddleware = basicAuth({
  users: {
    admin: 'admin123',
    user: 'user123'
  },
  challenge: true,
  realm: 'Smart Pantry API'
});

const getUserFromAuth = (req) => {
  const auth = req.auth;
  if (!auth) return null;
  
  const user = users[auth.user];
  return user ? { username: auth.user, role: user.role } : null;
};

const requireAdmin = (req, res, next) => {
  const user = getUserFromAuth(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  getUserFromAuth,
  requireAdmin
};

