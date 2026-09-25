#!/usr/bin/env node

require('dotenv').config();
const { supabase } = require('../server/supabase');

async function createUserID1Data() {
    console.log('🔧 Creating data for User ID 1 (fallback authentication)...\n');
    
    const userId = 1;
    
    try {
        // 1. Create user ID 1 if not exists
        console.log('1. Creating/updating user ID 1...');
        
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                id: 1,
                name: 'Nguyễn Văn A',
                email: 'demo@example.com',
                password: '$2a$10$dummy.hash.for.demo.user.only'
            }, { 
                onConflict: 'id',
                ignoreDuplicates: false 
            });
        
        if (upsertError) {
            console.log('User upsert note:', upsertError.message);
        } else {
            console.log('✅ User ID 1 created/updated');
        }
        
        // 2. Delete existing wallets for user 1
        await supabase.from('wallets').delete().eq('user_id', userId);
        
        // 3. Create wallets for user ID 1
        console.log('2. Creating wallets for user ID 1...');
        
        const wallets = [
            {
                user_id: userId,
                name: 'Tiền mặt',
                type: 'cash',
                balance: 5000000,
                icon: '💵',
                color: '#10b981'
            },
            {
                user_id: userId,
                name: 'Vietcombank',
                type: 'bank',
                balance: 25000000,
                icon: '🏦',
                color: '#3b82f6'
            },
            {
                user_id: userId,
                name: 'Ví MoMo',
                type: 'e-wallet',
                balance: 1500000,
                icon: '📱',
                color: '#e91e63'
            },
            {
                user_id: userId,
                name: 'Thẻ tín dụng',
                type: 'credit',
                balance: -2200000,
                icon: '💳',
                color: '#ff9800'
            }
        ];
        
        const { data: createdWallets, error: walletError } = await supabase
            .from('wallets')
            .insert(wallets)
            .select();
        
        if (walletError) {
            console.error('Wallet creation error:', walletError);
            throw walletError;
        }
        
        console.log(`✅ Created ${createdWallets.length} wallets for user ID 1`);
        
        // 4. Get categories
        console.log('3. Getting categories...');
        const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .limit(10);
        
        console.log(`✅ Found ${categories?.length || 0} categories`);
        
        // 5. Delete existing transactions for user 1
        await supabase.from('transactions').delete().eq('user_id', userId);
        
        // 6. Create transactions for user ID 1
        console.log('4. Creating transactions for user ID 1...');
        
        const today = new Date();
        const transactions = [
            {
                user_id: userId,
                wallet_id: createdWallets[1].id, // Vietcombank
                category_id: categories.find(c => c.name === 'Lương')?.id || categories[0]?.id,
                type: 'income',
                amount: 15000000,
                note: 'Lương tháng 9',
                date: '2026-09-25'
            },
            {
                user_id: userId,
                wallet_id: createdWallets[0].id, // Tiền mặt
                category_id: categories.find(c => c.name === 'Ăn uống')?.id || categories[0]?.id,
                type: 'expense',
                amount: 250000,
                note: 'Ăn trưa nhà hàng',
                date: today.toISOString().split('T')[0]
            },
            {
                user_id: userId,
                wallet_id: createdWallets[2].id, // MoMo
                category_id: categories.find(c => c.name === 'Ăn uống')?.id || categories[0]?.id,
                type: 'expense',
                amount: 85000,
                note: 'Café & Bánh ngọt',
                date: '2026-09-24'
            },
            {
                user_id: userId,
                wallet_id: createdWallets[3].id, // Credit
                category_id: categories.find(c => c.name === 'Mua sắm')?.id || categories[0]?.id,
                type: 'expense',
                amount: 1200000,
                note: 'Mua sắm Shopee',
                date: '2026-09-23'
            }
        ];
        
        const { data: createdTx, error: txError } = await supabase
            .from('transactions')
            .insert(transactions)
            .select();
        
        if (txError) {
            console.error('Transaction creation error:', txError);
            throw txError;
        }
        
        console.log(`✅ Created ${createdTx.length} transactions for user ID 1`);
        
        // 7. Verify data
        console.log('\n5. Verifying data for user ID 1...');
        
        const { data: testWallets } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId);
        
        const { data: testTx } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId);
        
        console.log(`✅ Verification: ${testWallets?.length || 0} wallets, ${testTx?.length || 0} transactions`);
        
        console.log('\n🎉 SUCCESS! User ID 1 now has complete data:');
        console.log('- 4 wallets with proper balances');
        console.log('- 4 transactions with categories');
        console.log('- Ready for production use');
        
        console.log('\n🚀 Frontend will now load data properly!');
        
    } catch (error) {
        console.error('❌ Error creating user ID 1 data:', error);
        throw error;
    }
}

if (require.main === module) {
    createUserID1Data()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { createUserID1Data };