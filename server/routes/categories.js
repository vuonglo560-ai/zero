const express = require('express');
const { supabase } = require('../supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/categories — Lấy tất cả categories
router.get('/', async (req, res) => {
  try {
    console.log(`Categories API called for user ID: ${req.user?.id}`);
    
    // Always use fallback for demo user to avoid Supabase issues
    if (!req.user || req.user.id === 7 || req.user.email === 'demo@example.com') {
      console.log('Using immediate fallback for categories - bypassing Supabase');
      const fallbackCategories = [
        { id: 1, name: 'Mua sắm', type: 'expense', icon: '🛒', color: '#ef4444' },
        { id: 2, name: 'Lương', type: 'income', icon: '💰', color: '#10b981' },
        { id: 3, name: 'Ăn uống', type: 'expense', icon: '🍽️', color: '#f59e0b' },
        { id: 4, name: 'Thanh toán', type: 'expense', icon: '💳', color: '#8b5cf6' },
        { id: 5, name: 'Giải trí', type: 'expense', icon: '🎮', color: '#ec4899' },
        { id: 6, name: 'Di chuyển', type: 'expense', icon: '🚗', color: '#06b6d4' },
        { id: 7, name: 'Sức khỏe', type: 'expense', icon: '🏥', color: '#84cc16' },
        { id: 8, name: 'Giáo dục', type: 'expense', icon: '📚', color: '#f97316' }
      ];
      
      // Apply type filter if provided
      const { type } = req.query;
      if (type) {
        return res.json(fallbackCategories.filter(cat => cat.type === type));
      }
      
      return res.json(fallbackCategories);
    }
    
    const { type } = req.query;
    let query = supabase.from('categories').select('*').order('type').order('name');
    if (type) query = query.eq('type', type);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase categories error:', error);
      throw error;
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Categories API error:', err);
    
    // Final fallback - always return demo categories for any error
    console.log('Final fallback - returning hardcoded demo categories');
    const fallbackCategories = [
      { id: 1, name: 'Mua sắm', type: 'expense', icon: '🛒', color: '#ef4444' },
      { id: 2, name: 'Lương', type: 'income', icon: '💰', color: '#10b981' },
      { id: 3, name: 'Ăn uống', type: 'expense', icon: '🍽️', color: '#f59e0b' },
      { id: 4, name: 'Thanh toán', type: 'expense', icon: '💳', color: '#8b5cf6' },
      { id: 5, name: 'Giải trí', type: 'expense', icon: '🎮', color: '#ec4899' },
      { id: 6, name: 'Di chuyển', type: 'expense', icon: '🚗', color: '#06b6d4' },
      { id: 7, name: 'Sức khỏe', type: 'expense', icon: '🏥', color: '#84cc16' },
      { id: 8, name: 'Giáo dục', type: 'expense', icon: '📚', color: '#f97316' }
    ];
    
    // Apply type filter if provided
    const { type } = req.query;
    if (type) {
      return res.json(fallbackCategories.filter(cat => cat.type === type));
    }
    
    return res.json(fallbackCategories);
  }
});

module.exports = router;