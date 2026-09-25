const jwt = require('jsonwebtoken');
const { supabase } = require('../supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'spendwise_personal_secret_key_2024_secure';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Set user from JWT payload (works for all users including demo)
    req.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email
    };
    
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

module.exports = { JWT_SECRET, authMiddleware };
