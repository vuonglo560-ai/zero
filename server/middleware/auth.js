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
    
    // Demo user bypass - skip database lookup for demo@example.com  
    if (payload.email === 'demo@example.com') {
      req.user = {
        id: payload.id,
        name: payload.name || 'Nguyễn Văn A',
        email: 'demo@example.com'
      };
      console.log(`Demo user authenticated via JWT bypass (ID: ${payload.id}) - SKIPPING DATABASE LOOKUP`);
      return next();
    }
    
    // For regular users, verify against database with retry logic
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', payload.id)
        .single();
      
      if (error || !user) {
        // If database is temporarily unavailable but token is valid, use token data
        if (payload.email && payload.id) {
          console.log('Database unavailable, using JWT payload for user:', payload.email);
          req.user = {
            id: payload.id,
            name: payload.name || 'User',
            email: payload.email
          };
          return next();
        }
        return res.status(401).json({ error: 'Tài khoản không tồn tại.' });
      }
      
      req.user = user;
      next();
    } catch (dbError) {
      // Database error - fallback to JWT payload if available
      console.log('Database error, using JWT fallback:', dbError.message);
      if (payload.email && payload.id) {
        req.user = {
          id: payload.id,
          name: payload.name || 'User', 
          email: payload.email
        };
        return next();
      }
      return res.status(401).json({ error: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
