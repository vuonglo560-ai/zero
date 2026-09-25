/**
 * Reset production database via API calls
 */
const https = require('https');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'spendwise-personal.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testProduction() {
  console.log('🌐 TESTING PRODUCTION DEPLOYMENT...\n');
  
  try {
    // 1. Test health
    console.log('🔍 Testing health endpoint...');
    const health = await makeRequest('GET', '/api/health');
    console.log('Health status:', health.status, health.data);
    
    // 2. Test registration with fresh email
    console.log('\n📝 Testing registration...');
    const timestamp = Date.now();
    const testUser = {
      name: 'Production Test User',
      email: `prodtest${timestamp}@example.com`,
      password: 'password123'
    };
    
    const registerResult = await makeRequest('POST', '/api/auth/register', testUser);
    console.log('Register result:', registerResult.status, registerResult.data);
    
    if (registerResult.status === 201) {
      console.log('✅ Registration works!');
      
      // Test login with new user
      const loginResult = await makeRequest('POST', '/api/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      console.log('Login result:', loginResult.status, loginResult.data);
      
      if (loginResult.status === 200) {
        console.log('✅ Login works!');
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }
    
    // 3. Test demo login
    console.log('\n🔐 Testing demo login...');
    const demoLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    console.log('Demo login result:', demoLogin.status, demoLogin.data);
    
    if (demoLogin.status === 200) {
      console.log('✅ Demo login works!');
    } else if (demoLogin.status === 401) {
      console.log('⚠️  Demo user not found or wrong password - need to create it');
      
      // Try to register demo user
      console.log('\n👤 Attempting to create demo user...');
      const demoRegister = await makeRequest('POST', '/api/auth/register', {
        name: 'Nguyễn Văn A',
        email: 'demo@example.com',
        password: 'demo123'
      });
      console.log('Demo register result:', demoRegister.status, demoRegister.data);
    }
    
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testProduction();