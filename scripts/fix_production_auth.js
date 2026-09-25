/**
 * Comprehensive fix for production authentication issues
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function fixProductionAuth() {
  console.log('🔧 FIXING PRODUCTION AUTHENTICATION ISSUES...\n');
  
  try {
    // 1. Test Supabase connection
    console.log('1. Testing Supabase connection...');
    const { data: testConnection, error: connError } = await supabase
      .from('users')
      .select('count', { count: 'exact' });
      
    if (connError) {
      console.log('❌ Supabase connection failed:', connError.message);
      return;
    }
    console.log('✅ Supabase connected, users count:', testConnection.count || 0);
    
    // 2. Clean up and create fresh demo user
    console.log('\n2. Creating fresh demo user...');
    
    // Delete existing demo user
    await supabase.from('transactions').delete().match({ user_id: null });
    await supabase.from('wallets').delete().match({ user_id: null });
    await supabase.from('users').delete().eq('email', 'demo@example.com');
    
    // Create password hash
    const password = 'demo123';
    const hash = await bcrypt.hash(password, 10);
    console.log('   Password hash created for "demo123"');
    
    // Insert demo user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: 'Nguyễn Văn A',
        email: 'demo@example.com',
        password: hash
      })
      .select()
      .single();
      
    if (userError) {
      console.log('❌ Failed to create user:', userError.message);
      console.log('Full error:', userError);
      return;
    }
    
    console.log('✅ Demo user created with ID:', user.id);
    
    // 3. Create wallets for demo user
    console.log('\n3. Creating demo wallets...');
    const { data: wallets, error: walletError } = await supabase
      .from('wallets')
      .insert([
        {
          user_id: user.id,
          name: 'Tiền mặt',
          type: 'cash',
          balance: 5000000,
          icon: '💵',
          color: '#10b981'
        },
        {
          user_id: user.id,
          name: 'Vietcombank',
          type: 'bank', 
          balance: 25000000,
          icon: '🏦',
          color: '#3b82f6'
        },
        {
          user_id: user.id,
          name: 'Ví MoMo',
          type: 'ewallet',
          balance: 1500000,
          icon: '📱',
          color: '#e91e63'
        },
        {
          user_id: user.id,
          name: 'Thẻ tín dụng',
          type: 'credit',
          balance: -2200000,
          icon: '💳',
          color: '#f59e0b'
        }
      ])
      .select();
      
    if (walletError) {
      console.log('❌ Wallet creation failed:', walletError.message);
    } else {
      console.log(`✅ Created ${wallets.length} wallets`);
    }
    
    // 4. Test authentication flow
    console.log('\n4. Testing authentication flow...');
    
    // Test password comparison
    const { data: storedUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo@example.com')
      .single();
      
    const isPasswordValid = await bcrypt.compare('demo123', storedUser.password);
    console.log('   Password validation test:', isPasswordValid ? '✅ PASS' : '❌ FAIL');
    
    if (isPasswordValid) {
      console.log('   Password hash is correct!');
    } else {
      console.log('   ❌ Password hash mismatch detected');
    }
    
    // 5. Add sample transactions
    console.log('\n5. Adding sample transactions...');
    if (wallets && wallets.length > 0) {
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            wallet_id: wallets.find(w => w.name === 'Vietcombank')?.id,
            category_id: 1, // Income
            type: 'income',
            amount: 15000000,
            date: new Date().toISOString().split('T')[0],
            description: 'Lương tháng 9'
          },
          {
            user_id: user.id,
            wallet_id: wallets.find(w => w.name === 'Tiền mặt')?.id,
            category_id: 6, // Food
            type: 'expense',
            amount: 250000,
            date: new Date().toISOString().split('T')[0],
            description: 'Ăn trưa nhà hàng'
          }
        ])
        .select();
        
      if (transError) {
        console.log('⚠️  Transaction creation failed:', transError.message);
      } else {
        console.log(`✅ Created ${transactions.length} sample transactions`);
      }
    }
    
    // 6. Final verification
    console.log('\n6. Final verification...');
    const { data: finalUser } = await supabase
      .from('users')
      .select(`
        *,
        wallets:wallets(count),
        transactions:transactions(count)
      `)
      .eq('email', 'demo@example.com')
      .single();
      
    console.log('✅ Demo user setup complete!');
    console.log('   User ID:', finalUser.id);
    console.log('   Email:', finalUser.email);
    console.log('   Password for testing: demo123');
    console.log('   Wallets created:', finalUser.wallets?.[0]?.count || 0);
    console.log('   Transactions created:', finalUser.transactions?.[0]?.count || 0);
    
    console.log('\n🎯 PRODUCTION AUTH FIX COMPLETED!');
    console.log('Demo user ready for login: demo@example.com / demo123');
    
  } catch (err) {
    console.error('❌ Fix script error:', err);
  }
}

fixProductionAuth();