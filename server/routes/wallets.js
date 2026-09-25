const express = require('express');
const { supabase } = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/wallets
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.user.id)
      .order('id');
      
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Wallets error:', err);
    res.json([]);
  }
});

// POST /api/wallets
router.post('/', async (req, res) => {
  try {
    const { name, type, balance, icon, color } = req.body;
    if (!name || !type || balance == null) {
      return res.status(400).json({ error: 'Thiếu thông tin ví.' });
    }

    const { data, error } = await supabase
      .from('wallets')
      .insert([{ user_id: req.user.id, name, type, balance: Number(balance), icon, color }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Create wallet error:', err);
    res.status(500).json({ error: 'Lỗi tạo ví.' });
  }
});

// PUT /api/wallets/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, balance, icon, color } = req.body;

    const { data, error } = await supabase
      .from('wallets')
      .update({ name, type, balance: Number(balance), icon, color })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Không tìm thấy ví.' });
    res.json(data);
  } catch (err) {
    console.error('Update wallet error:', err);
    res.status(500).json({ error: 'Lỗi cập nhật ví.' });
  }
});

// DELETE /api/wallets/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Xóa ví thành công.' });
  } catch (err) {
    console.error('Delete wallet error:', err);
    res.status(500).json({ error: 'Lỗi xóa ví.' });
  }
});

module.exports = router;
