const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../supabase');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    if (password.length < 6) return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });

    // Demo bypass for presentation  
    if (email.includes('@example.com') || email.includes('@demo.com')) {
      const demoUser = {
        id: Math.floor(Math.random() * 1000) + 100,
        name: name,
        email: email
      };
      const token = jwt.sign({ 
        id: demoUser.id, 
        email: demoUser.email, 
        name: demoUser.name 
      }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: 'Đăng ký thành công!',
        token,
        user: demoUser
      });
    }

    // Kiểm tra email đã tồn tại
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) return res.status(409).json({ error: 'Email này đã được đăng ký.' });

    const hash = await bcrypt.hash(password, 10);
    
    // Try insert without explicit ID (let sequence auto-generate)
    let { data: user, error: insertErr } = await supabase
      .from('users')
      .insert({ name, email, password: hash })
      .select('id, name, email')
      .single();

    // If sequence error, try to fix sequence and retry
    if (insertErr && insertErr.code === '23505' && insertErr.message.includes('users_pkey')) {
      console.log('⚠️ Sequence conflict detected, attempting to fix...');
      
      // Get max ID and set sequence
      const { data: maxIdResult } = await supabase
        .from('users')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      if (maxIdResult && maxIdResult.length > 0) {
        const nextId = maxIdResult[0].id + 1;
        // Use raw SQL to fix sequence
        await supabase.rpc('exec_sql', { 
          sql: `SELECT setval('public.users_id_seq', ${nextId});` 
        }).catch(() => {}); // Ignore errors
        
        // Retry insert
        const retry = await supabase
          .from('users')
          .insert({ name, email, password: hash })
          .select('id, name, email')
          .single();
          
        user = retry.data;
        insertErr = retry.error;
      }
    }

    if (insertErr) throw insertErr;

    // Tạo mặc định 2 ví tiền cho user mới
    const { error: walletErr } = await supabase.from('wallets').insert([
      { user_id: user.id, name: 'Tiền mặt', type: 'cash', balance: 0, icon: '💵', color: '#10b981' },
      { user_id: user.id, name: 'Tài khoản Ngân hàng', type: 'bank', balance: 0, icon: '🏦', color: '#3b82f6' },
    ]);
    
    // If wallet creation fails due to sequence, try to fix it
    if (walletErr && walletErr.code === '23505') {
      console.log('⚠️ Wallet sequence conflict, attempting to fix...');
      const { data: maxWalletId } = await supabase
        .from('wallets')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      if (maxWalletId && maxWalletId.length > 0) {
        const nextWalletId = maxWalletId[0].id + 1;
        await supabase.rpc('exec_sql', { 
          sql: `SELECT setval('public.wallets_id_seq', ${nextWalletId});` 
        }).catch(() => {});
        
        // Retry wallet creation
        await supabase.from('wallets').insert([
          { user_id: user.id, name: 'Tiền mặt', type: 'cash', balance: 0, icon: '💵', color: '#10b981' },
          { user_id: user.id, name: 'Tài khoản Ngân hàng', type: 'bank', balance: 0, icon: '🏦', color: '#3b82f6' },
        ]);
      }
    }

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name 
    }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Đăng ký thành công!', token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Lỗi server khi đăng ký.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });

    // Demo bypass for presentation
    if (email === 'demo@example.com' && password === 'demo123') {
      console.log('Demo login attempt - searching for user in database...');
      
      // Get actual demo user from database
      try {
        const { data: demoUser, error: userError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('email', 'demo@example.com')
          .maybeSingle();
          
        if (userError) {
          console.error('Database error during demo login:', userError);
        }
        
        if (demoUser) {
          console.log(`Demo login success with actual user ID: ${demoUser.id}`);
          const token = jwt.sign({ 
            id: demoUser.id, 
            email: demoUser.email, 
            name: demoUser.name 
          }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: demoUser
          });
        } else {
          console.log('Demo user not found in database, using fallback ID 1');
          // Fallback to static demo user
          const fallbackUser = {
            id: 1,
            name: 'Nguyễn Văn A',
            email: 'demo@example.com'
          };
          const token = jwt.sign({ 
            id: fallbackUser.id, 
            email: fallbackUser.email, 
            name: fallbackUser.name 
          }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: fallbackUser
          });
        }
      } catch (dbError) {
        console.error('Database connection error during demo login:', dbError);
        // Fallback to static demo user
        const fallbackUser = {
          id: 1,
          name: 'Nguyễn Văn A',
          email: 'demo@example.com'
        };
        const token = jwt.sign({ 
          id: fallbackUser.id, 
          email: fallbackUser.email, 
          name: fallbackUser.name 
        }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          message: 'Đăng nhập thành công!',
          token,
          user: fallbackUser
        });
      }
    }

    const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name 
    }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi server khi đăng nhập.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Demo user - return stored data immediately
    if (req.user.email === 'demo@example.com') {
      return res.json({
        id: req.user.id,
        name: req.user.name || 'Nguyễn Văn A',
        email: 'demo@example.com',
        created_at: '2024-09-01T00:00:00.000Z'
      });
    }
    
    // Regular users - try database first, fallback to JWT data
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('id', req.user.id)
        .single();
      
      if (error) {
        // Database error - return JWT payload data
        console.log('Database error in /me, using JWT fallback:', error.message);
        return res.json({
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          created_at: new Date().toISOString()
        });
      }
      
      res.json(user);
    } catch (dbError) {
      // Fallback to JWT payload if database is unavailable
      console.log('Database unavailable in /me, using JWT data');
      res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        created_at: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Error in /api/auth/me:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

module.exports = router;
