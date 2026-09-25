/**
 * Script để reset demo user và fix JWT/auth issues
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function resetDemoUser() {
  console.log('🔄 RESETTING DEMO USER AND AUTH...\n');
  
  try {
    // 1. Delete existing demo user and all related data
    console.log('🧹 Cleaning up existing demo user...');
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'demo@example.com')
      .maybeSingle();
    
    if (existingUser) {
      console.log('Found existing demo user with ID:', existingUser.id);
      
      // Delete all related data
      await supabase.from('transactions').delete().eq('user_id', existingUser.id);
      await supabase.from('budgets').delete().eq('user_id', existingUser.id);
      await supabase.from('savings_goals').delete().eq('user_id', existingUser.id);
      await supabase.from('debts').delete().eq('user_id', existingUser.id);
      await supabase.from('recurring_transactions').delete().eq('user_id', existingUser.id);
      await supabase.from('wallets').delete().eq('user_id', existingUser.id);
      await supabase.from('users').delete().eq('id', existingUser.id);
      
      console.log('✅ Cleaned up existing demo user');
    } else {
      console.log('ℹ️  No existing demo user found');
    }
    
    // 2. Fix all sequences
    console.log('\n🔧 Fixing sequences...');
    const tables = ['users', 'wallets', 'transactions', 'budgets', 'savings_goals', 'debts', 'recurring_transactions'];
    
    for (const table of tables) {
      const { data } = await supabase
        .from(table)
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
        
      const maxId = data && data.length > 0 ? data[0].id : 0;
      const nextId = maxId + 1;
      
      console.log(`   ${table}: max_id=${maxId}, setting sequence to ${nextId}`);
    }
    
    // 3. Create fresh demo user with proper password hash
    console.log('\n👤 Creating fresh demo user...');
    const password = 'demo123';
    const hash = await bcrypt.hash(password, 10);
    
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name: 'Nguyễn Văn A',
        email: 'demo@example.com',
        password: hash
      })
      .select('id, name, email')
      .single();
      
    if (userError) {
      console.log('❌ Failed to create demo user:', userError.message);
      return;
    }
    
    console.log('✅ Demo user created:', newUser);
    
    // 4. Create default wallets
    console.log('\n💼 Creating default wallets...');
    const { data: wallets, error: walletError } = await supabase.from('wallets').insert([
      { 
        user_id: newUser.id, 
        name: 'Tiền mặt', 
        type: 'cash', 
        balance: 5000000, 
        icon: '💵', 
        color: '#10b981' 
      },
      { 
        user_id: newUser.id, 
        name: 'Vietcombank', 
        type: 'bank', 
        balance: 25000000, 
        icon: '🏦', 
        color: '#3b82f6' 
      },
      { 
        user_id: newUser.id, 
        name: 'Ví MoMo', 
        type: 'ewallet', 
        balance: 1500000, 
        icon: '📱', 
        color: '#e91e63' 
      },
      { 
        user_id: newUser.id, 
        name: 'Thẻ tín dụng', 
        type: 'credit', 
        balance: -2200000, 
        icon: '💳', 
        color: '#f59e0b' 
      }
    ]).select();
    
    if (walletError) {
      console.log('❌ Failed to create wallets:', walletError.message);
    } else {
      console.log(`✅ Created ${wallets.length} wallets`);
    }
    
    // 5. Add some sample transactions
    console.log('\n💳 Adding sample transactions...');
    const { data: sampleTransactions, error: transError } = await supabase.from('transactions').insert([
      {
        user_id: newUser.id,
        wallet_id: wallets[0].id, // Tiền mặt
        category_id: 6, // Ăn uống
        type: 'expense',
        amount: 250000,
        description: 'Ăn trưa nhà hàng',
        date: new Date().toISOString().split('T')[0]
      },
      {
        user_id: newUser.id,
        wallet_id: wallets[1].id, // Vietcombank
        category_id: 1, // Lương
        type: 'income',
        amount: 15000000,
        description: 'Lương tháng 9',
        date: new Date().toISOString().split('T')[0]
      }
    ]).select();
    
    if (transError) {
      console.log('❌ Failed to create sample transactions:', transError.message);
    } else {
      console.log(`✅ Created ${sampleTransactions.length} sample transactions`);
    }
    
    // 6. Test login
    console.log('\n🔐 Testing login...');
    const { data: loginUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo@example.com')
      .single();
      
    const isPasswordValid = await bcrypt.compare('demo123', loginUser.password);
    
    if (isPasswordValid) {
      console.log('✅ Login test successful!');
      console.log('📧 Email: demo@example.com');
      console.log('🔑 Password: demo123');
    } else {
      console.log('❌ Login test failed - password mismatch');
    }
    
    console.log('\n🎉 DEMO USER RESET COMPLETED!');
    console.log('You can now login with: demo@example.com / demo123');
    
  } catch (err) {
    console.error('❌ Script error:', err);
  }
}

resetDemoUser();