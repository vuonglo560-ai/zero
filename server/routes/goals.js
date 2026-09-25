const express = require('express');
const { supabase } = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/goals â€” Láº¥y cÃ¡c má»¥c tiÃªu tiáº¿t kiá»‡m
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('savings_goals').select('*')
      .eq('user_id', req.user.id)
      .order('deadline', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Goals GET error:', err); res.json([]);
  }
});

// POST /api/goals â€” Táº¡o má»¥c tiÃªu tiáº¿t kiá»‡m má»›i
router.post('/', async (req, res) => {
  try {
    const { name, target_amount, current_amount = 0, deadline, icon, color } = req.body;
    if (!name || !target_amount || Number(target_amount) <= 0) {
      return res.status(400).json({ error: 'TÃªn má»¥c tiÃªu vÃ  sá»‘ tiá»n má»¥c tiÃªu pháº£i há»£p lá»‡ (> 0).' });
    }

    const { data, error } = await supabase.from('savings_goals').insert({
      user_id: req.user.id,
      name,
      target_amount: Number(target_amount),
      current_amount: Number(current_amount) || 0,
      deadline: deadline || null,
      icon: icon || 'ðŸŽ¯',
      color: color || '#8b5cf6',
    }).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

// POST /api/goals/:id/deposit â€” ThÃªm tiá»n vÃ o má»¥c tiÃªu tiáº¿t kiá»‡m
router.post('/:id/deposit', async (req, res) => {
  try {
    const { amount, wallet_id } = req.body;
    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) return res.status(400).json({ error: 'Sá»‘ tiá»n náº¡p pháº£i lá»›n hÆ¡n 0.' });

    const { data: goal, error: findErr } = await supabase.from('savings_goals').select('*')
      .eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (findErr || !goal) return res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y má»¥c tiÃªu tiáº¿t kiá»‡m.' });

    if (wallet_id) {
      const { data: wallet } = await supabase.from('wallets').select('*')
        .eq('id', wallet_id).eq('user_id', req.user.id).single();
      if (!wallet) return res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y vÃ­ tiá»n.' });
      if (Number(wallet.balance) < depositAmount) return res.status(400).json({ error: `Sá»‘ dÆ° vÃ­ "${wallet.name}" khÃ´ng Ä‘á»§.` });
      await supabase.from('wallets').update({ balance: Number(wallet.balance) - depositAmount }).eq('id', wallet.id);
    }

    const { data: updated, error: updateErr } = await supabase.from('savings_goals')
      .update({ current_amount: Number(goal.current_amount) + depositAmount })
      .eq('id', goal.id).select().single();

    if (updateErr) throw updateErr;
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

// DELETE /api/goals/:id â€” XÃ³a má»¥c tiÃªu
router.delete('/:id', async (req, res) => {
  try {
    const { data: goal, error: findErr } = await supabase.from('savings_goals').select('*')
      .eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (findErr || !goal) return res.status(404).json({ error: 'KhÃ´ng tÃ¬m tháº¥y má»¥c tiÃªu tiáº¿t kiá»‡m.' });

    const { error } = await supabase.from('savings_goals').delete().eq('id', goal.id);
    if (error) throw error;
    res.json({ message: 'ÄÃ£ xÃ³a má»¥c tiÃªu tiáº¿t kiá»‡m.' });
  } catch (err) {
    res.status(500).json({ error: 'Lá»—i server.' });
  }
});

module.exports = router;
