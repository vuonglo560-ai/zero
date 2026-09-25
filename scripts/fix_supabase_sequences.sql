-- Fix Supabase ID Sequences - CRITICAL FIX
-- Run this in Supabase SQL Editor to reset sequences

-- 1. Check current max IDs in each table
SELECT 'users' as table_name, COALESCE(MAX(id), 0) as max_id FROM public.users
UNION ALL
SELECT 'wallets' as table_name, COALESCE(MAX(id), 0) as max_id FROM public.wallets
UNION ALL
SELECT 'transactions' as table_name, COALESCE(MAX(id), 0) as max_id FROM public.transactions
UNION ALL
SELECT 'budgets' as table_name, COALESCE(MAX(id), 0) as max_id FROM public.budgets
UNION ALL
SELECT 'savings_goals' as table_name, COALESCE(MAX(id), 0) as max_id FROM public.savings_goals
UNION ALL
SELECT 'debts' as table_name, COALESCE(MAX(id), 0) as max_id FROM public.debts
UNION ALL
SELECT 'recurring_transactions' as table_name, COALESCE(MAX(id), 0) as max_id FROM public.recurring_transactions;

-- 2. Reset sequences to max_id + 1 (must run each line separately in Supabase SQL Editor)
SELECT setval('public.users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.users));
SELECT setval('public.wallets_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.wallets));
SELECT setval('public.transactions_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.transactions));
SELECT setval('public.budgets_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.budgets));
SELECT setval('public.savings_goals_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.savings_goals));
SELECT setval('public.debts_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.debts));
SELECT setval('public.recurring_transactions_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.recurring_transactions));

-- 3. Verify sequences are now correct
SELECT 
  schemaname,
  sequencename, 
  last_value as next_id
FROM pg_sequences 
WHERE schemaname = 'public'
ORDER BY sequencename;

-- 4. Test insert (should work now)
-- INSERT INTO users (name, email, password) VALUES ('Test User', 'test@example.com', 'hash');
-- DELETE FROM users WHERE email = 'test@example.com';

SELECT 'All sequences reset successfully! New user registration should work now.' as status;