/**
 * Test production API trực tiếp với detailed logging
 */
const https = require('https');

function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: password
    });

    const options = {
      hostname: 'spendwise-personal.onrender.com',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json',
        'User-Agent': 'Node.js Test Client'
      }
    };

    console.log('🔍 Testing login with:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   URL:', `https://${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
      console.log('\n📡 Response received:');
      console.log('   Status Code:', res.statusCode);
      console.log('   Status Message:', res.statusMessage);
      console.log('   Headers:', JSON.stringify(res.headers, null, 2));

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n📄 Response Body:');
        console.log('   Raw:', data);
        
        try {
          const parsed = JSON.parse(data);
          console.log('   Parsed:', JSON.stringify(parsed, null, 2));
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          console.log('   Parse Error:', e.message);
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request Error:', err);
      reject(err);
    });

    req.on('timeout', () => {
      console.error('⏰ Request Timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(10000); // 10 second timeout
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 PRODUCTION LOGIN TESTS\n');
  
  try {
    // Test 1: Demo user
    console.log('='.repeat(50));
    console.log('TEST 1: Demo User Login');
    console.log('='.repeat(50));
    
    const result1 = await testLogin('demo@example.com', 'demo123');
    
    // Test 2: Alternative password cases
    if (result1.status === 401) {
      console.log('\n='.repeat(50));
      console.log('TEST 2: Alternative Password Cases');
      console.log('='.repeat(50));
      
      const altPasswords = ['Demo123', 'DEMO123', 'demo'];
      
      for (const pwd of altPasswords) {
        console.log(`\n--- Testing password: "${pwd}" ---`);
        const altResult = await testLogin('demo@example.com', pwd);
        if (altResult.status === 200) {
          console.log('🎉 FOUND WORKING PASSWORD:', pwd);
          break;
        }
      }
    }

  } catch (err) {
    console.error('🚨 Test failed:', err.message);
  }
}

runTests();