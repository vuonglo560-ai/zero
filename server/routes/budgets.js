const express = require('express');
const { supabase } = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function getMonthRange(month) {
  const [year, m] = month.split('-').map(Number);
  const start = `${year}-${String(m).padStart(2, '0')}-01`;
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? year + 1 : year;
  const end = `${nextY}-${String(nextM).padStart(2, '0')}-01`;
  return { start, end };
}

// GET /api/budgets?month=YYYY-MM â€” Láº¥y danh sÃ¡ch háº¡n má»©c ngÃ¢n sÃ¡ch thÃ¡ng + sá»‘ tiá»n Ä‘Ã£ chi thá»±c táº¿
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const { start, end } = getMonthRange(month);

    const { data: budgets, error } = await supabase.from('budgets')
      .select('*, categories(name, icon, color)')
      .eq('user_id', userId)
      .eq('month', month)
      .order('amount_limit', { ascending: false });

    if (error) throw error;

    // TÃ­nh toÃ¡n sá»‘ tiá»n Ä‘Ã£ chi thá»±c táº¿ cho tá»«ng danh má»¥c
    const { data: txs } = await supabase.from('transactions')
      .select('category_id, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', start)
      .lt('date', end);

    const spentMap = {};
    for (const t of txs || []) {
      spentMap[t.category_id] = (spentMap[t.category_id] || 0) + Number(t.amount);
    }

    const result = (budgets || []).map(b => ({
      ...b,
      category_name: b.categories?.name,
      category_icon: b.categories?.icon,
      category_color: b.categories?.color,
      spent_amount: spentMap[b.category_id] || 0,
      categories: undefined,
    }));

    res.json(result);
  } catch (err) {
    console.error('GET budgets error:', err);
    console.error('Budgets GET error:', err); res.json([]);
  }
});

// POST /api/budgets â€” Äáº·t / Cáº­p nháº­t ngÃ¢n sÃ¡ch cho danh má»¥c
router.post('/', async (req, res) => {
  try {
    const { category_id, amount_limit, month } = req.body;
    if (!category_id || !amount_limit || Number(amount_limit) <= 0 || !month) {
      return res.status(400).json({ error: 'Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ danh má»¥c, thÃ¡ng vÃ  háº¡n má»©c > 0.' });
    }

    const userId = req.user.id;
    const { data: existing } = await supabase.from('budgets').select('id')
      .eq('user_id', userId).eq('category_id', category_id).eq('month', month).maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase.from('budgets')
        .update({ amount_limit: Number(amount_limit) })
        .eq('id', existing.id).select().single();
      if (error) throw error;
      result = data;
      return res.json(result);
    } else {
      const { data, error } = await supabase.from('budgets')
        .insert({ user_id: userId, category_id, amount_limit: Number(amount_limit), month })
        .select().single();
      if (error) throw error;
      result = data;
      return res.status(201).json(result);
    }
  } catch (err) {
    console.error('POST budgets error:', err);
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

// DELETE /api/budgets/:id â€” XÃ³a ngÃ¢n sÃ¡ch
router.delete('/:id', async (req, res) => {
  try {
    const { data: budget, error: findErr } = await supabase.from('budgets').select('*')
      .eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (findErr || !budget) return res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y ngÃ¢n sÃ¡ch.' });

    const { error } = await supabase.from('budgets').delete().eq('id', budget.id);
    if (error) throw error;
    res.json({ message: 'ÄÃ£ xÃ³a ngÃ¢n sÃ¡ch thÃ nh cÃ´ng.' });
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

module.exports = router;
