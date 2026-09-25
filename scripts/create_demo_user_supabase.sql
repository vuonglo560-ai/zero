-- Create demo user and sample data directly in Supabase
-- Run this after disabling RLS

-- 1. Clean up existing data
DELETE FROM public.transactions WHERE user_id IN (SELECT id FROM public.users WHERE email = 'demo@example.com');
DELETE FROM public.budgets WHERE user_id IN (SELECT id FROM public.users WHERE email = 'demo@example.com');
DELETE FROM public.savings_goals WHERE user_id IN (SELECT id FROM public.users WHERE email = 'demo@example.com');
DELETE FROM public.debts WHERE user_id IN (SELECT id FROM public.users WHERE email = 'demo@example.com');
DELETE FROM public.recurring_transactions WHERE user_id IN (SELECT id FROM public.users WHERE email = 'demo@example.com');
DELETE FROM public.wallets WHERE user_id IN (SELECT id FROM public.users WHERE email = 'demo@example.com');
DELETE FROM public.users WHERE email = 'demo@example.com';

-- 2. Create demo user with bcrypt hash for 'demo123'
INSERT INTO public.users (name, email, password) VALUES 
('Nguyễn Văn A', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- 3. Get the user ID 
DO $$
DECLARE
    demo_user_id INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM public.users WHERE email = 'demo@example.com';
    
    -- 4. Create default wallets
    INSERT INTO public.wallets (user_id, name, type, balance, icon, color) VALUES
    (demo_user_id, 'Tiền mặt', 'cash', 5000000, '💵', '#10b981'),
    (demo_user_id, 'Vietcombank', 'bank', 25000000, '🏦', '#3b82f6'),
    (demo_user_id, 'Ví MoMo', 'ewallet', 1500000, '📱', '#e91e63'),
    (demo_user_id, 'Thẻ tín dụng', 'credit', -2200000, '💳', '#f59e0b');
    
    -- 5. Add some sample transactions
    INSERT INTO public.transactions (user_id, wallet_id, category_id, type, amount, date, created_at) VALUES
    (demo_user_id, (SELECT id FROM public.wallets WHERE user_id = demo_user_id AND name = 'Tiền mặt'), 6, 'expense', 250000, CURRENT_DATE, CURRENT_TIMESTAMP),
    (demo_user_id, (SELECT id FROM public.wallets WHERE user_id = demo_user_id AND name = 'Vietcombank'), 1, 'income', 15000000, CURRENT_DATE, CURRENT_TIMESTAMP),
    (demo_user_id, (SELECT id FROM public.wallets WHERE user_id = demo_user_id AND name = 'Ví MoMo'), 6, 'expense', 85000, CURRENT_DATE - 1, CURRENT_TIMESTAMP),
    (demo_user_id, (SELECT id FROM public.wallets WHERE user_id = demo_user_id AND name = 'Thẻ tín dụng'), 8, 'expense', 1200000, CURRENT_DATE - 2, CURRENT_TIMESTAMP);
    
    -- 6. Add budget
    INSERT INTO public.budgets (user_id, category_id, amount_limit, month, created_at) VALUES
    (demo_user_id, 6, 2000000, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), CURRENT_TIMESTAMP);
    
    -- 7. Add savings goal (without target_date - column doesn't exist)
    INSERT INTO public.savings_goals (user_id, name, target_amount, current_amount, created_at) VALUES
    (demo_user_id, 'Mua laptop mới', 25000000, 5000000, CURRENT_TIMESTAMP);
    
END $$;

-- Success message
SELECT 'Demo user created successfully with sample data!' as status;