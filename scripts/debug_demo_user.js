#!/usr/bin/env node

require('dotenv').config();
const { supabase } = require('../server/supabase');

async function debugDemoUser() {
    console.log('🔍 Debugging Demo User in Production Database...\n');
    
    try {
        // 1. Check all users with email demo@example.com
        console.log('1. Searching for demo users by email...');
        const { data: usersByEmail, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'demo@example.com');
        
        if (emailError) {
            console.error('Email search error:', emailError);
        } else {
            console.log(`Found ${usersByEmail.length} users with demo@example.com:`);
            usersByEmail.forEach(user => {
                console.log(`   ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
            });
        }
        
        console.log('');
        
        // 2. Check user ID 1
        console.log('2. Checking user ID 1...');
        const { data: user1, error: user1Error } = await supabase
            .from('users')
            .select('*')
            .eq('id', 1)
            .maybeSingle();
        
        if (user1Error) {
            console.error('User ID 1 error:', user1Error);
        } else if (user1) {
            console.log(`User ID 1: Name: ${user1.name}, Email: ${user1.email}`);
        } else {
            console.log('User ID 1: Not found');
        }
        
        console.log('');
        
        // 3. Check user ID 7
        console.log('3. Checking user ID 7...');
        const { data: user7, error: user7Error } = await supabase
            .from('users')
            .select('*')
            .eq('id', 7)
            .maybeSingle();
        
        if (user7Error) {
            console.error('User ID 7 error:', user7Error);
        } else if (user7) {
            console.log(`User ID 7: Name: ${user7.name}, Email: ${user7.email}`);
        } else {
            console.log('User ID 7: Not found');
        }
        
        console.log('');
        
        // 4. Check wallets for each found user
        if (usersByEmail && usersByEmail.length > 0) {
            for (const user of usersByEmail) {
                console.log(`4. Checking wallets for user ID ${user.id}...`);
                const { data: wallets, error: walletError } = await supabase
                    .from('wallets')
                    .select('*')
                    .eq('user_id', user.id);
                
                if (walletError) {
                    console.error(`Wallet error for user ${user.id}:`, walletError);
                } else {
                    console.log(`   User ${user.id} has ${wallets.length} wallets`);
                    wallets.forEach(wallet => {
                        console.log(`      ${wallet.icon} ${wallet.name}: ₫${wallet.balance.toLocaleString('vi-VN')}`);
                    });
                }
                
                console.log(`5. Checking transactions for user ID ${user.id}...`);
                const { data: transactions, error: txError } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id);
                
                if (txError) {
                    console.error(`Transaction error for user ${user.id}:`, txError);
                } else {
                    console.log(`   User ${user.id} has ${transactions.length} transactions`);
                }
                
                console.log('');
            }
        }
        
        // 6. Test authentication simulation
        console.log('6. Testing authentication simulation...');
        const testEmail = 'demo@example.com';
        const { data: authTestUser, error: authError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('email', testEmail)
            .maybeSingle();
        
        if (authError) {
            console.error('Auth test error:', authError);
        } else if (authTestUser) {
            console.log(`Auth test success: Found user ID ${authTestUser.id}`);
        } else {
            console.log('Auth test: No user found - will use fallback');
        }
        
    } catch (error) {
        console.error('Debug error:', error);
    }
}

debugDemoUser();