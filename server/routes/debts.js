const express = require('express');
const { supabase } = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/debts â€” Láº¥y danh sÃ¡ch ná»£ & cho vay
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('debts').select('*')
      .eq('user_id', req.user.id)
      .order('is_paid', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Debts GET error:', err); res.json([]);
  }
});

// POST /api/debts â€” Táº¡o khoáº£n ná»£ / cho vay má»›i
router.post('/', async (req, res) => {
  try {
    const { person_name, type, amount, due_date, note } = req.body;
    if (!person_name || !type || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Vui lÃ²ng nháº­p ngÆ°á»i liÃªn quan, loáº¡i khoáº£n tiá»n vÃ  sá»‘ tiá»n > 0.' });
    }
    if (!['lend', 'borrow'].includes(type)) {
      return res.status(400).json({ error: 'Loáº¡i khoáº£n ná»£ khÃ´ng há»£p lá»‡.' });
    }

    const { data, error } = await supabase.from('debts').insert({
      user_id: req.user.id,
      person_name,
      type,
      amount: Number(amount),
      due_date: due_date || null,
      note: note || null,
      is_paid: 0,
    }).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

// PATCH /api/debts/:id/toggle-paid â€” ÄÃ¡nh dáº¥u Ä‘Ã£ tráº£ / thu xong ná»£
router.patch('/:id/toggle-paid', async (req, res) => {
  try {
    const { data: debt, error: findErr } = await supabase.from('debts').select('*')
      .eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (findErr || !debt) return res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin vay/ná»£.' });

    const { data, error } = await supabase.from('debts')
      .update({ is_paid: debt.is_paid === 1 ? 0 : 1 })
      .eq('id', debt.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

// DELETE /api/debts/:id â€” XÃ³a khoáº£n ná»£
router.delete('/:id', async (req, res) => {
  try {
    const { data: debt, error: findErr } = await supabase.from('debts').select('*')
      .eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (findErr || !debt) return res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin vay/ná»£.' });

    const { error } = await supabase.from('debts').delete().eq('id', debt.id);
    if (error) throw error;
    res.json({ message: 'ÄÃ£ xÃ³a khoáº£n ná»£ thÃ nh cÃ´ng.' });
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

module.exports = router;
