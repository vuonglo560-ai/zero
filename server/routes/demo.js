const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Demo data cho demo@example.com user
const DEMO_DATA = {
  wallets: [
    { id: 1, user_id: 1, name: 'Tiền mặt', type: 'cash', balance: 5000000, icon: '💵', color: '#10b981' },
    { id: 2, user_id: 1, name: 'Vietcombank', type: 'bank', balance: 25000000, icon: '🏦', color: '#3b82f6' },
    { id: 3, user_id: 1, name: 'Ví MoMo', type: 'ewallet', balance: 1500000, icon: '📱', color: '#e91e63' },
    { id: 4, user_id: 1, name: 'Thẻ tín dụng', type: 'credit', balance: -2200000, icon: '💳', color: '#f59e0b' }
  ],
  
  transactions: [
    { id: 1, user_id: 1, wallet_id: 2, category_id: 1, type: 'income', amount: 15000000, date: '2026-09-25', created_at: new Date() },
    { id: 2, user_id: 1, wallet_id: 1, category_id: 6, type: 'expense', amount: 250000, date: '2026-09-25', created_at: new Date() },
    { id: 3, user_id: 1, wallet_id: 3, category_id: 6, type: 'expense', amount: 85000, date: '2026-09-24', created_at: new Date() },
    { id: 4, user_id: 1, wallet_id: 4, category_id: 8, type: 'expense', amount: 1200000, date: '2026-09-23', created_at: new Date() },
    { id: 5, user_id: 1, wallet_id: 1, category_id: 4, type: 'expense', amount: 180000, date: '2026-09-22', created_at: new Date() }
  ],

  categories: [
    { id: 1, name: 'Lương & Thu nhập', type: 'income', icon: '💰', color: '#10b981' },
    { id: 2, name: 'Đầu tư & Lợi nhuận', type: 'income', icon: '📈', color: '#059669' },
    { id: 3, name: 'Thưởng & Phụ cấp', type: 'income', icon: '🎁', color: '#34d399' },
    { id: 4, name: 'Di chuyển & Xăng xe', type: 'expense', icon: '🚗', color: '#f59e0b' },
    { id: 5, name: 'Mua sắm & Thời trang', type: 'expense', icon: '🛍️', color: '#ec4899' },
    { id: 6, name: 'Ăn uống & Thực phẩm', type: 'expense', icon: '🍽️', color: '#f97316' },
    { id: 7, name: 'Giải trí & Du lịch', type: 'expense', icon: '🎮', color: '#8b5cf6' },
    { id: 8, name: 'Hóa đơn & Tiện ích', type: 'expense', icon: '🏠', color: '#6b7280' },
    { id: 9, name: 'Y tế & Sức khỏe', type: 'expense', icon: '🏥', color: '#ef4444' },
    { id: 10, name: 'Giáo dục & Học tập', type: 'expense', icon: '📚', color: '#3b82f6' }
  ],

  budgets: [
    { id: 1, user_id: 1, category_id: 6, amount_limit: 2000000, month: '2026-09', spent: 840000 },
    { id: 2, user_id: 1, category_id: 4, amount_limit: 800000, month: '2026-09', spent: 180000 }
  ],

  savings_goals: [
    { id: 1, user_id: 1, name: 'Mua laptop mới', target_amount: 25000000, current_amount: 5000000 },
    { id: 2, user_id: 1, name: 'Quỹ dự phòng', target_amount: 50000000, current_amount: 12000000 }
  ],

  debts: [
    { id: 1, user_id: 1, person_name: 'Anh Tuấn', type: 'lend', amount: 2000000, due_date: '2026-10-15' },
    { id: 2, user_id: 1, person_name: 'Chị Hoa', type: 'borrow', amount: 1500000, due_date: '2026-10-01' }
  ]
};

// Middleware để check demo user
const checkDemoUser = (req, res, next) => {
  if (req.user && (req.user.email === 'demo@example.com' || req.user.id === 1)) {
    req.isDemo = true;
  }
  next();
};

// GET /api/demo/dashboard
router.get('/dashboard', authMiddleware, checkDemoUser, (req, res) => {
  if (!req.isDemo) {
    return res.status(403).json({ error: 'Demo endpoint chỉ dành cho demo user' });
  }

  const totalIncome = DEMO_DATA.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = DEMO_DATA.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netWorth = DEMO_DATA.wallets
    .reduce((sum, w) => sum + w.balance, 0);

  res.json({
    summary: {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_worth: netWorth,
      wallet_count: DEMO_DATA.wallets.length
    },
    recent_transactions: DEMO_DATA.transactions.slice(0, 5),
    budget_alerts: DEMO_DATA.budgets.map(b => ({
      ...b,
      percentage: Math.round((b.spent / b.amount_limit) * 100),
      category_name: DEMO_DATA.categories.find(c => c.id === b.category_id)?.name
    }))
  });
});

// GET /api/demo/wallets
router.get('/wallets', authMiddleware, checkDemoUser, (req, res) => {
  if (!req.isDemo) {
    return res.status(403).json({ error: 'Demo endpoint chỉ dành cho demo user' });
  }
  res.json(DEMO_DATA.wallets);
});

// GET /api/demo/transactions
router.get('/transactions', authMiddleware, checkDemoUser, (req, res) => {
  if (!req.isDemo) {
    return res.status(403).json({ error: 'Demo endpoint chỉ dành cho demo user' });
  }
  
  const transactionsWithDetails = DEMO_DATA.transactions.map(t => ({
    ...t,
    wallet_name: DEMO_DATA.wallets.find(w => w.id === t.wallet_id)?.name,
    category_name: DEMO_DATA.categories.find(c => c.id === t.category_id)?.name,
    category_icon: DEMO_DATA.categories.find(c => c.id === t.category_id)?.icon
  }));
  
  res.json(transactionsWithDetails);
});

// GET /api/demo/categories
router.get('/categories', authMiddleware, checkDemoUser, (req, res) => {
  if (!req.isDemo) {
    return res.status(403).json({ error: 'Demo endpoint chỉ dành cho demo user' });
  }
  res.json(DEMO_DATA.categories);
});

module.exports = router;