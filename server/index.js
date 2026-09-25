require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Documentation endpoint - MUST BE BEFORE app.use('/api/...')
app.get('/api', (req, res) => {
  res.redirect('/api-docs.html');
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/demo', require('./routes/demo'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/wallets', require('./routes/wallets'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/debts', require('./routes/debts'));
app.use('/api/recurring', require('./routes/recurring'));

app.get('/api/health', (req, res) => {
  const { supabase } = require('./supabase');
  res.json({
    status: supabase ? 'ok' : 'warning',
    message: supabase
      ? 'SpendWise Personal dang ch?y! (Supabase Cloud) - Updated for Testing'
      : '?? Supabase chua k?t n?i — ki?m tra Environment Variables',
    supabase_connected: !!supabase,
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/standalone-demo', (req, res) => {
  const demoPath = path.join(__dirname, '..', 'public', 'standalone-demo.html');
  if (fs.existsSync(demoPath)) {
    res.sendFile(demoPath);
  } else {
    res.status(404).send('Demo page not found');
  }
});

app.get('/no-auth-demo', (req, res) => {
  const demoPath = path.join(__dirname, '..', 'public', 'no-auth-demo.html');
  if (fs.existsSync(demoPath)) {
    res.sendFile(demoPath);
  } else {
    res.status(404).send('Demo page not found');
  }
});

app.get('/monitor', (req, res) => {
  const monitorPath = path.join(__dirname, '..', 'public', 'monitor-dashboard.html');
  if (fs.existsSync(monitorPath)) {
    res.sendFile(monitorPath);
  } else {
    res.status(404).send('Monitor dashboard not found');
  }
});

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Không tìm th?y trang.' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n?? SpendWise Personal: http://localhost:${PORT}`);
    console.log(`?? ?ng d?ng Qu?n lý Chi tiêu Cá nhân trên Cloud`);
    console.log(`? Ðang s? d?ng Supabase Cloud Database\n`);
  });
}

module.exports = app;
