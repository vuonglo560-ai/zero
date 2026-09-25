-- Fix RLS Issues: Disable RLS for custom JWT auth
-- Run this in Supabase SQL Editor

-- Disable Row Level Security (We use custom JWT auth, not Supabase Auth)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can manage own goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can manage own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can manage own recurring" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Categories are viewable by all" ON public.categories;

-- Grant full access to authenticated role (our backend uses SERVICE_ROLE key)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure categories table allows read access
GRANT SELECT ON public.categories TO authenticated, anon;
GRANT SELECT ON public.categories TO postgres;

-- Success message
SELECT 'RLS disabled successfully! Custom JWT auth will handle authorization.' as status;