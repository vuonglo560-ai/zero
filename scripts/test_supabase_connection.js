/**
 * Script kiểm tra kết nối Supabase và debug issues
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 KIỂM TRA KẾT NỐI SUPABASE...\n');

// Kiểm tra environment variables
console.log('📋 ENVIRONMENT VARIABLES:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

if (process.env.SUPABASE_URL) {
  console.log('URL:', process.env.SUPABASE_URL);
}
if (process.env.SUPABASE_ANON_KEY) {
  console.log('ANON_KEY length:', process.env.SUPABASE_ANON_KEY.length, 'chars');
}
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('SERVICE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY.length, 'chars');
}

console.log('\n🔧 TESTING CONNECTIONS...\n');

// Test với ANON key
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  const anonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  
  console.log('🔑 Testing ANON KEY...');
  anonClient.from('users').select('count', { count: 'exact' })
    .then(({ data, error, count }) => {
      if (error) {
        console.log('❌ ANON KEY failed:', error.message);
      } else {
        console.log('✅ ANON KEY works! User count:', count);
      }
    })
    .catch(err => console.log('❌ ANON KEY error:', err.message));
}

// Test với SERVICE_ROLE key
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const serviceClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  
  console.log('🔐 Testing SERVICE_ROLE KEY...');
  serviceClient.from('users').select('count', { count: 'exact' })
    .then(({ data, error, count }) => {
      if (error) {
        console.log('❌ SERVICE_ROLE KEY failed:', error.message);
      } else {
        console.log('✅ SERVICE_ROLE KEY works! User count:', count);
      }
    })
    .catch(err => console.log('❌ SERVICE_ROLE KEY error:', err.message));
}

// Test insert với SERVICE_ROLE
setTimeout(async () => {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const serviceClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('\n📝 Testing INSERT operation...');
    
    const testUser = {
      name: 'Test User ' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: '$2a$10$dummy.hash.for.testing'
    };
    
    try {
      const { data, error } = await serviceClient
        .from('users')
        .insert(testUser)
        .select('id, name, email')
        .single();
        
      if (error) {
        console.log('❌ INSERT failed:', error.message);
        console.log('Error details:', error);
      } else {
        console.log('✅ INSERT works! Created user:', data);
        
        // Clean up test user
        await serviceClient.from('users').delete().eq('id', data.id);
        console.log('🧹 Test user cleaned up');
      }
    } catch (err) {
      console.log('❌ INSERT error:', err.message);
    }
  }
  
  console.log('\n✅ Test completed!');
}, 2000);