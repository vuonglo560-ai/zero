/**
 * Fix tất cả sequences trong Supabase
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function fixSequences() {
  console.log('🔧 FIXING ALL SEQUENCES...\n');
  
  try {
    // Get max IDs from each table
    const tables = ['users', 'wallets', 'transactions', 'budgets', 'savings_goals', 'debts', 'recurring_transactions'];
    
    for (const table of tables) {
      console.log(`🔍 Checking ${table} table...`);
      
      // Get max ID
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
        
      if (error) {
        console.log(`❌ Error getting max ID for ${table}:`, error.message);
        continue;
      }
      
      const maxId = data.length > 0 ? data[0].id : 0;
      const nextId = maxId + 1;
      
      console.log(`   Current max ID: ${maxId}, setting sequence to: ${nextId}`);
      
      // Fix sequence using raw SQL
      const sequenceName = `${table}_id_seq`;
      const { error: seqError } = await supabase.rpc('exec_sql', {
        sql: `SELECT setval('public.${sequenceName}', ${nextId});`
      });
      
      if (seqError) {
        console.log(`   ❌ Failed to fix ${sequenceName}:`, seqError.message);
      } else {
        console.log(`   ✅ Fixed ${sequenceName}`);
      }
    }
    
    console.log('\n✅ All sequences should be fixed!');
    console.log('🧪 Testing user registration...');
    
    // Test registration
    const testEmail = 'seqtest' + Date.now() + '@example.com';
    const { data: newUser, error: regError } = await supabase
      .from('users')
      .insert({
        name: 'Sequence Test',
        email: testEmail,
        password: '$2a$10$dummy.hash'
      })
      .select('id, name, email')
      .single();
      
    if (regError) {
      console.log('❌ Registration still fails:', regError.message);
    } else {
      console.log('✅ Registration works! New user:', newUser);
      
      // Test wallet creation
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: newUser.id,
          name: 'Test Wallet',
          type: 'cash',
          balance: 0,
          icon: '💵',
          color: '#10b981'
        })
        .select()
        .single();
        
      if (walletError) {
        console.log('❌ Wallet creation fails:', walletError.message);
      } else {
        console.log('✅ Wallet creation works!', wallet);
      }
      
      // Cleanup
      await supabase.from('wallets').delete().eq('user_id', newUser.id);
      await supabase.from('users').delete().eq('id', newUser.id);
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (err) {
    console.error('❌ Script error:', err);
  }
}

fixSequences();