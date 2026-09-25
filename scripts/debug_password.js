/**
 * Debug password hash và login process
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function debugPassword() {
  console.log('🔍 DEBUGGING PASSWORD HASH...\n');
  
  try {
    // 1. Get user from database
    console.log('1. Fetching demo user from database...');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo@example.com')
      .single();
      
    if (error) {
      console.log('❌ User not found:', error.message);
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Password hash:', user.password);
    console.log('   Hash length:', user.password.length);
    
    // 2. Test different passwords
    console.log('\n2. Testing password combinations...');
    
    const passwords = ['demo123', 'Demo123', 'DEMO123', 'demo'];
    
    for (const pwd of passwords) {
      const isMatch = await bcrypt.compare(pwd, user.password);
      console.log(`   "${pwd}" -> ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    // 3. Create fresh hash and test
    console.log('\n3. Creating fresh hash for "demo123"...');
    const freshHash = await bcrypt.hash('demo123', 10);
    console.log('   Fresh hash:', freshHash);
    
    const freshTest = await bcrypt.compare('demo123', freshHash);
    console.log('   Fresh hash test:', freshTest ? '✅ OK' : '❌ FAIL');
    
    // 4. Test with the exact hash we used in SQL
    console.log('\n4. Testing SQL hash...');
    const sqlHash = '$2a$10$JBilZxat.iNKs4/x/r9O4eCi.p4DNGYa..FPmRBDlid.u5Q5oElzK';
    const sqlTest = await bcrypt.compare('demo123', sqlHash);
    console.log('   SQL hash test:', sqlTest ? '✅ OK' : '❌ FAIL');
    
    // 5. Update user with fresh hash if needed
    if (!await bcrypt.compare('demo123', user.password)) {
      console.log('\n5. Updating user with fresh hash...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: freshHash })
        .eq('email', 'demo@example.com');
        
      if (updateError) {
        console.log('❌ Update failed:', updateError.message);
      } else {
        console.log('✅ Password updated successfully!');
        console.log('   New hash:', freshHash);
      }
    } else {
      console.log('\n5. ✅ Password hash is already correct!');
    }
    
  } catch (err) {
    console.error('❌ Debug error:', err);
  }
}

debugPassword();