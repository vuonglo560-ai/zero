-- SpendWise Personal Database Schema for Supabase PostgreSQL
-- Execute this in Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
    icon VARCHAR(10) DEFAULT '📁',
    color VARCHAR(20) DEFAULT '#6b7280'
);

-- 3. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('cash', 'bank', 'ewallet', 'credit')) DEFAULT 'cash',
    balance DECIMAL(15,2) DEFAULT 0,
    icon VARCHAR(10) DEFAULT '💵',
    color VARCHAR(20) DEFAULT '#10b981',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_id BIGINT REFERENCES public.wallets(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE RESTRICT,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE CASCADE,
    amount_limit DECIMAL(15,2) NOT NULL CHECK (amount_limit > 0),
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id, month)
);

-- 6. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    icon VARCHAR(10) DEFAULT '🎯',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Debts Table
CREATE TABLE IF NOT EXISTS public.debts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    person_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) CHECK (type IN ('lend', 'borrow')) NOT NULL,
    due_date DATE,
    is_paid BOOLEAN DEFAULT FALSE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Recurring Transactions Table
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_id BIGINT REFERENCES public.wallets(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE RESTRICT,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31) DEFAULT 1,
    note TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Categories
INSERT INTO public.categories (id, name, type, icon, color) VALUES
(1, 'Lương & Thu nhập chính', 'income', '💰', '#10b981'),
(2, 'Freelance & Thêm thu', 'income', '💻', '#059669'),
(3, 'Đầu tư & Lãi suất', 'income', '📈', '#34d399'),
(4, 'Quà tặng & Thưởng', 'income', '🎁', '#6ee7b7'),
(5, 'Bán đồ & Thu khác', 'income', '🏷️', '#a7f3d0'),
(6, 'Ăn uống & Thực phẩm', 'expense', '🍔', '#ef4444'),
(7, 'Di chuyển & Xăng xe', 'expense', '🚗', '#f97316'),
(8, 'Mua sắm & Quần áo', 'expense', '🛍️', '#8b5cf6'),
(9, 'Giải trí & Phim ảnh', 'expense', '🎬', '#ec4899'),
(10, 'Y tế & Sức khỏe', 'expense', '🏥', '#06b6d4'),
(11, 'Giáo dục & Học tập', 'expense', '📚', '#3b82f6'),
(12, 'Nhà cửa & Tiện ích', 'expense', '🏠', '#64748b'),
(13, 'Quà tặng & Từ thiện', 'expense', '🎁', '#f59e0b'),
(14, 'Chi phí khác', 'expense', '📝', '#6b7280')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Users can only access their own data)
-- Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (id = auth.uid()::bigint);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = auth.uid()::bigint);

-- Wallets
CREATE POLICY "Users can view own wallets" ON public.wallets FOR ALL USING (user_id = auth.uid()::bigint);

-- Transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (user_id = auth.uid()::bigint);

-- Budgets
CREATE POLICY "Users can manage own budgets" ON public.budgets FOR ALL USING (user_id = auth.uid()::bigint);

-- Savings Goals
CREATE POLICY "Users can manage own goals" ON public.savings_goals FOR ALL USING (user_id = auth.uid()::bigint);

-- Debts
CREATE POLICY "Users can manage own debts" ON public.debts FOR ALL USING (user_id = auth.uid()::bigint);

-- Recurring Transactions
CREATE POLICY "Users can manage own recurring" ON public.recurring_transactions FOR ALL USING (user_id = auth.uid()::bigint);

-- Categories are public (read-only for all users)
CREATE POLICY "Categories are viewable by all" ON public.categories FOR SELECT TO authenticated, anon USING (true);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON public.recurring_transactions(user_id);

-- Reset sequence counters
SELECT setval('public.categories_id_seq', 14, true);