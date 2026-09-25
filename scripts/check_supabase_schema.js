/**
 * Kiểm tra schema và dữ liệu hiện tại của Supabase
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function checkSchema() {
  console.log('🔍 CHECKING SUPABASE SCHEMA & DATA...\n');
  
  try {
    // Check users table
    console.log('👤 USERS TABLE:');
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    if (usersError) {
      console.log('❌ Users error:', usersError.message);
    } else {
      console.log(`✅ Users count: ${users.length}`);
      if (users.length > 0) {
        console.log('First user:', { id: users[0].id, email: users[0].email, name: users[0].name });
      }
    }
    
    // Check wallets table
    console.log('\n💼 WALLETS TABLE:');
    const { data: wallets, error: walletsError } = await supabase.from('wallets').select('*');
    if (walletsError) {
      console.log('❌ Wallets error:', walletsError.message);
    } else {
      console.log(`✅ Wallets count: ${wallets.length}`);
    }
    
    // Check categories table
    console.log('\n📋 CATEGORIES TABLE:');
    const { data: categories, error: categoriesError } = await supabase.from('categories').select('*');
    if (categoriesError) {
      console.log('❌ Categories error:', categoriesError.message);
    } else {
      console.log(`✅ Categories count: ${categories.length}`);
      if (categories.length === 0) {
        console.log('⚠️  No categories found - need to seed data!');
      }
    }
    
    // Test insert new user
    console.log('\n📝 TESTING USER REGISTRATION:');
    const testEmail = 'testuser' + Date.now() + '@example.com';
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: 'Test User',
        email: testEmail,
        password: '$2a$10$dummy.hash.for.testing.only'
      })
      .select('id, name, email')
      .single();
      
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('Full error:', insertError);
    } else {
      console.log('✅ Insert success:', newUser);
      
      // Try to insert default wallets for new user
      const { data: newWallets, error: walletError } = await supabase.from('wallets').insert([
        { user_id: newUser.id, name: 'Tiền mặt', type: 'cash', balance: 0, icon: '💵', color: '#10b981' },
        { user_id: newUser.id, name: 'Ngân hàng', type: 'bank', balance: 0, icon: '🏦', color: '#3b82f6' }
      ]).select();
      
      if (walletError) {
        console.log('❌ Wallet insert failed:', walletError.message);
      } else {
        console.log('✅ Default wallets created:', newWallets.length);
      }
      
      // Clean up
      await supabase.from('wallets').delete().eq('user_id', newUser.id);
      await supabase.from('users').delete().eq('id', newUser.id);
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkSchema();