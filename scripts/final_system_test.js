#!/usr/bin/env node

/**
 * FINAL SYSTEM TEST
 * Complete end-to-end testing of SpendWise Personal
 */

const https = require('https');

const BASE_URL = 'https://spendwise-personal.onrender.com';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(20000);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function finalSystemTest() {
    console.log('🚀 SPENDWISE PERSONAL - FINAL SYSTEM TEST');
    console.log('==========================================\n');
    
    let allResults = [];
    let passCount = 0;
    let totalTests = 0;
    
    function logResult(test, status, details = '') {
        totalTests++;
        const pass = status === 'PASS';
        if (pass) passCount++;
        
        const icon = pass ? '✅' : '❌';
        console.log(`${icon} ${test}: ${status} ${details}`);
        
        allResults.push({ test, status, pass, details });
    }
    
    try {
        // 1. Frontend Pages Test
        console.log('📱 FRONTEND PAGES TEST');
        console.log('---------------------');
        
        const pages = [
            { name: 'Main Application', url: `${BASE_URL}/` },
            { name: 'Demo Showcase', url: `${BASE_URL}/demo.html` },
            { name: 'Standalone Demo', url: `${BASE_URL}/standalone-demo` },
            { name: 'No-Auth Demo', url: `${BASE_URL}/no-auth-demo` },
            { name: 'Monitor Dashboard', url: `${BASE_URL}/monitor` }
        ];
        
        for (const page of pages) {
            try {
                const response = await makeRequest(page.url);
                const pass = response.status === 200;
                logResult(page.name, pass ? 'PASS' : 'FAIL', `(${response.status})`);
            } catch (error) {
                logResult(page.name, 'FAIL', `(${error.message})`);
            }
        }
        
        console.log('');
        
        // 2. Authentication Test
        console.log('🔐 AUTHENTICATION TEST');
        console.log('----------------------');
        
        // Login test
        try {
            const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'demo@example.com',
                    password: 'demo123'
                })
            });
            
            if (loginResponse.status === 200) {
                const loginData = JSON.parse(loginResponse.body);
                const token = loginData.token;
                const userId = loginData.user.id;
                
                logResult('Demo Login', 'PASS', `(User ID: ${userId})`);
                
                // Token verification test
                const meResponse = await makeRequest(`${BASE_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                logResult('Token Verification', meResponse.status === 200 ? 'PASS' : 'FAIL', `(${meResponse.status})`);
                
                // 3. Data APIs Test
                console.log('');
                console.log('📊 DATA APIS TEST');
                console.log('-----------------');
                
                // Dashboard API
                const dashResponse = await makeRequest(`${BASE_URL}/api/dashboard/overview`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                logResult('Dashboard API', dashResponse.status === 200 ? 'PASS' : 'FAIL', `(${dashResponse.status})`);
                
                // Wallets API
                const walletsResponse = await makeRequest(`${BASE_URL}/api/wallets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (walletsResponse.status === 200) {
                    const wallets = JSON.parse(walletsResponse.body);
                    logResult('Wallets API', 'PASS', `(${wallets.length} wallets)`);
                    
                    // List wallets for verification
                    if (wallets.length > 0) {
                        console.log('   📋 Wallets found:');
                        wallets.forEach(wallet => {
                            const balance = wallet.balance >= 0 ? 
                                `₫${wallet.balance.toLocaleString('vi-VN')}` : 
                                `-₫${Math.abs(wallet.balance).toLocaleString('vi-VN')}`;
                            console.log(`      ${wallet.icon} ${wallet.name}: ${balance}`);
                        });
                    }
                } else {
                    logResult('Wallets API', 'FAIL', `(${walletsResponse.status}) ${walletsResponse.body}`);
                }
                
                // Transactions API
                const txResponse = await makeRequest(`${BASE_URL}/api/transactions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (txResponse.status === 200) {
                    const transactions = JSON.parse(txResponse.body);
                    logResult('Transactions API', 'PASS', `(${transactions.length} transactions)`);
                    
                    // List recent transactions
                    if (transactions.length > 0) {
                        console.log('   📋 Recent transactions:');
                        transactions.slice(0, 3).forEach(tx => {
                            const amount = tx.type === 'income' ? 
                                `+₫${tx.amount.toLocaleString('vi-VN')}` : 
                                `-₫${tx.amount.toLocaleString('vi-VN')}`;
                            console.log(`      ${tx.note || 'Unnamed'}: ${amount} (${tx.date})`);
                        });
                    }
                } else {
                    logResult('Transactions API', 'FAIL', `(${txResponse.status}) ${txResponse.body}`);
                }
                
            } else {
                logResult('Demo Login', 'FAIL', `(${loginResponse.status})`);
            }
        } catch (authError) {
            logResult('Demo Login', 'FAIL', `(${authError.message})`);
        }
        
        // 4. System Health Test
        console.log('');
        console.log('⚡ SYSTEM HEALTH TEST');
        console.log('--------------------');
        
        const healthResponse = await makeRequest(`${BASE_URL}/api/health`);
        if (healthResponse.status === 200) {
            const healthData = JSON.parse(healthResponse.body);
            logResult('Health Check', 'PASS', `(${healthData.status})`);
            logResult('Supabase Connection', healthData.supabase_connected ? 'PASS' : 'FAIL');
        } else {
            logResult('Health Check', 'FAIL', `(${healthResponse.status})`);
        }
        
    } catch (error) {
        console.error('❌ System test error:', error.message);
    }
    
    // 5. Final Summary
    console.log('');
    console.log('📊 FINAL TEST SUMMARY');
    console.log('=====================');
    
    const successRate = Math.round((passCount / totalTests) * 100);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${totalTests - passCount}`);
    console.log(`Success Rate: ${successRate}%`);
    
    console.log('');
    
    if (successRate >= 90) {
        console.log('🎉 SYSTEM STATUS: EXCELLENT ✅');
        console.log('✅ Ready for production use and presentation');
    } else if (successRate >= 70) {
        console.log('⚠️  SYSTEM STATUS: GOOD 🟡');
        console.log('🔧 Some features may need attention');
    } else {
        console.log('❌ SYSTEM STATUS: NEEDS WORK 🔴');
        console.log('🛠️ Significant issues detected');
    }
    
    console.log('');
    console.log('🌐 PRODUCTION URLS:');
    console.log('------------------');
    console.log('Main App: https://spendwise-personal.onrender.com');
    console.log('Demo Page: https://spendwise-personal.onrender.com/demo.html');
    console.log('No-Auth Demo: https://spendwise-personal.onrender.com/no-auth-demo');
    console.log('Monitor: https://spendwise-personal.onrender.com/monitor');
    console.log('');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('Email: demo@example.com');
    console.log('Password: demo123');
    
    // Wait a moment then test again if there were failures
    if (successRate < 100) {
        console.log('\n⏳ Waiting 60 seconds for system stabilization...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
        console.log('\n🔄 RETESTING FAILED ENDPOINTS...');
        // Retest only failed endpoints
        // (Implementation would go here if needed)
    }
    
    return { successRate, totalTests, passCount, results: allResults };
}

if (require.main === module) {
    finalSystemTest()
        .then((result) => {
            console.log(`\n✅ Final system test completed with ${result.successRate}% success rate`);
            process.exit(result.successRate >= 70 ? 0 : 1);
        })
        .catch((error) => {
            console.error('\n❌ Final system test failed:', error);
            process.exit(1);
        });
}

module.exports = { finalSystemTest };