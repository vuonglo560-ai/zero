const express = require('express');
const { supabase } = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Helper: flatten Supabase nested join result
function flattenRecurring(r) {
  return {
    ...r,
    category_name: r.categories?.name,
    category_icon: r.categories?.icon,
    category_color: r.categories?.color,
    wallet_name: r.wallets?.name,
    wallet_icon: r.wallets?.icon,
    categories: undefined,
    wallets: undefined,
  };
}

// GET /api/recurring â€” Láº¥y danh sÃ¡ch giao dá»‹ch Ä‘á»‹nh ká»³ cá»§a user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('recurring_transactions')
      .select('*, categories(name, icon, color), wallets(name, icon)')
      .eq('user_id', req.user.id)
      .order('day_of_month', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(flattenRecurring));
  } catch (err) {
    console.error('Recurring GET error:', err); res.json([]);
  }
});

// POST /api/recurring â€” Táº¡o quy táº¯c giao dá»‹ch Ä‘á»‹nh ká»³ má»›i
router.post('/', async (req, res) => {
  try {
    const { wallet_id, category_id, type, amount, note, day_of_month = 1 } = req.body;
    if (!category_id || !type || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ danh má»¥c, loáº¡i vÃ  sá»‘ tiá»n há»£p lá»‡ (> 0).' });
    }

    const { data, error } = await supabase.from('recurring_transactions').insert({
      user_id: req.user.id,
      wallet_id: wallet_id || null,
      category_id,
      type,
      amount: Number(amount),
      note: note || null,
      day_of_month: Number(day_of_month) || 1,
    }).select('*, categories(name, icon, color), wallets(name, icon)').single();

    if (error) throw error;
    res.status(201).json(flattenRecurring(data));
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

// POST /api/recurring/:id/execute â€” Ghi nháº­n nhanh 1 giao dá»‹ch tá»« quy táº¯c Ä‘á»‹nh ká»³
router.post('/:id/execute', async (req, res) => {
  try {
    const { data: rule, error: findErr } = await supabase.from('recurring_transactions').select('*')
      .eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (findErr || !rule) return res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y quy táº¯c giao dá»‹ch Ä‘á»‹nh ká»³.' });

    const todayStr = new Date().toISOString().slice(0, 10);
    const numAmount = Number(rule.amount);

    const { data: tx, error: txErr } = await supabase.from('transactions').insert({
      user_id: req.user.id,
      wallet_id: rule.wallet_id,
      category_id: rule.category_id,
      type: rule.type,
      amount: numAmount,
      note: `[Äá»‹nh ká»³] ${rule.note || ''}`,
      date: todayStr,
    }).select('*, categories(name, icon)').single();

    if (txErr) throw txErr;

    // Cáº­p nháº­t sá»‘ dÆ° vÃ­
    if (rule.wallet_id) {
      const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', rule.wallet_id).single();
      if (wallet) {
        const balanceChange = rule.type === 'income' ? numAmount : -numAmount;
        await supabase.from('wallets').update({ balance: Number(wallet.balance) + balanceChange }).eq('id', rule.wallet_id);
      }
    }

    res.json({
      message: 'ÄÃ£ ghi nháº­n giao dá»‹ch Ä‘á»‹nh ká»³ thÃ nh cÃ´ng!',
      transaction: {
        ...tx,
        category_name: tx.categories?.name,
        category_icon: tx.categories?.icon,
        categories: undefined,
      },
    });
  } catch (err) {
    console.error('Execute recurring error:', err);
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

// DELETE /api/recurring/:id â€” XÃ³a quy táº¯c Ä‘á»‹nh ká»³
router.delete('/:id', async (req, res) => {
  try {
    const { data: rule, error: findErr } = await supabase.from('recurring_transactions').select('*')
      .eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (findErr || !rule) return res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y quy táº¯c Ä‘á»‹nh ká»³.' });

    const { error } = await supabase.from('recurring_transactions').delete().eq('id', rule.id);
    if (error) throw error;
    res.json({ message: 'ÄÃ£ xÃ³a quy táº¯c Ä‘á»‹nh ká»³.' });
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

module.exports = router;
