#!/usr/bin/env node

/**
 * Fix Demo Data Script
 * Creates demo data for user ID 1 (demo@example.com) in Supabase
 */

require('dotenv').config();
const { supabase } = require('../server/supabase');

async function fixDemoData() {
    console.log('🔧 Fixing demo data for user ID 1...');
    
    const userId = 1;
    let actualUserId = userId;
    
    try {
        // 1. Check if user exists, create if not
        console.log('1. Checking demo user...');
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', actualUserId)
            .maybeSingle();
        
        if (!existingUser) {
            console.log('Creating demo user...');
            
            // First try with explicit ID
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: userId,
                    name: 'Nguyễn Văn A',
                    email: 'demo@example.com',
                    password: '$2a$10$dummy.hash.for.demo.user.only'
                }, { onConflict: 'id' });
            
            if (userError) {
                console.log('Trying alternative user creation method...');
                
                // Alternative: Use raw SQL
                const { error: sqlError } = await supabase.rpc('exec_sql', {
                    sql: `
                        INSERT INTO users (id, name, email, password, created_at, updated_at) 
                        VALUES (1, 'Nguyễn Văn A', 'demo@example.com', '$2a$10$dummy.hash.for.demo.user.only', NOW(), NOW())
                        ON CONFLICT (id) DO UPDATE SET 
                            name = EXCLUDED.name,
                            email = EXCLUDED.email,
                            updated_at = NOW();
                    `
                });
                
                if (sqlError) {
                    console.error('SQL user creation error:', sqlError);
                    // Try one more time with simple insert
                    console.log('Attempting simple insert...');
                    
                    const bcrypt = require('bcryptjs');
                    const hashedPassword = await bcrypt.hash('demo123', 10);
                    
                    const { error: finalError } = await supabase
                        .from('users')
                        .insert({
                            name: 'Nguyễn Văn A',
                            email: 'demo@example.com',
                            password: hashedPassword
                        });
                    
                    if (finalError) {
                        console.log('Final insert error (user might exist):', finalError.message);
                    }
                }
            }
            
            // Verify user exists after creation attempts
            const { data: verifyUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', 'demo@example.com')
                .maybeSingle();
            
            if (verifyUser) {
                console.log(`✅ Demo user verified with ID: ${verifyUser.id}`);
                // Update actualUserId to the actual created ID
                actualUserId = verifyUser.id;
            } else {
                throw new Error('Failed to create or find demo user');
            }
        } else {
            console.log('✅ Demo user exists');
        }
        
        // 2. Create demo wallets
        console.log('2. Creating demo wallets...');
        
        // Delete existing wallets for clean start
        await supabase.from('wallets').delete().eq('user_id', actualUserId);
        
        const wallets = [
            {
                user_id: actualUserId,
                name: 'Tiền mặt',
                type: 'cash',
                balance: 5000000,
                icon: '💵',
                color: '#10b981'
            },
            {
                user_id: actualUserId,
                name: 'Vietcombank',
                type: 'bank',
                balance: 25000000,
                icon: '🏦',
                color: '#3b82f6'
            },
            {
                user_id: actualUserId,
                name: 'Ví MoMo',
                type: 'e-wallet',
                balance: 1500000,
                icon: '📱',
                color: '#e91e63'
            },
            {
                user_id: actualUserId,
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
        
        console.log(`✅ Created ${createdWallets.length} wallets`);
        
        // 3. Get categories for transactions
        console.log('3. Getting categories...');
        const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .limit(10);
        
        if (!categories || categories.length === 0) {
            console.log('No categories found, creating basic categories...');
            const basicCategories = [
                { name: 'Ăn uống', type: 'expense', icon: '🍽️', color: '#ef4444' },
                { name: 'Lương', type: 'income', icon: '💰', color: '#10b981' },
                { name: 'Mua sắm', type: 'expense', icon: '🛒', color: '#f59e0b' },
                { name: 'Di chuyển', type: 'expense', icon: '🚗', color: '#3b82f6' },
                { name: 'Giải trí', type: 'expense', icon: '🎮', color: '#8b5cf6' }
            ];
            
            const { data: newCategories, error: catError } = await supabase
                .from('categories')
                .insert(basicCategories)
                .select();
            
            if (catError) {
                console.error('Category creation error:', catError);
            } else {
                console.log(`✅ Created ${newCategories.length} categories`);
            }
        } else {
            console.log(`✅ Found ${categories.length} categories`);
        }
        
        // Get updated categories
        const { data: allCategories } = await supabase
            .from('categories')
            .select('*');
        
        // 4. Create demo transactions
        console.log('4. Creating demo transactions...');
        
        // Delete existing transactions for clean start
        await supabase.from('transactions').delete().eq('user_id', actualUserId);
        
        const today = new Date();
        const transactions = [
            {
                user_id: actualUserId,
                wallet_id: createdWallets[1].id, // Vietcombank
                category_id: allCategories.find(c => c.name === 'Lương')?.id || allCategories[0]?.id,
                type: 'income',
                amount: 15000000,
                note: 'Lương tháng 9',
                date: '2026-09-25'
            },
            {
                user_id: actualUserId,
                wallet_id: createdWallets[0].id, // Tiền mặt
                category_id: allCategories.find(c => c.name === 'Ăn uống')?.id || allCategories[0]?.id,
                type: 'expense',
                amount: 250000,
                note: 'Ăn trưa nhà hàng',
                date: today.toISOString().split('T')[0]
            },
            {
                user_id: actualUserId,
                wallet_id: createdWallets[2].id, // MoMo
                category_id: allCategories.find(c => c.name === 'Ăn uống')?.id || allCategories[0]?.id,
                type: 'expense',
                amount: 85000,
                note: 'Café & Bánh ngọt',
                date: '2026-09-24'
            },
            {
                user_id: actualUserId,
                wallet_id: createdWallets[3].id, // Credit
                category_id: allCategories.find(c => c.name === 'Mua sắm')?.id || allCategories[0]?.id,
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
        
        console.log(`✅ Created ${createdTx.length} transactions`);
        
        // 5. Test API endpoints
        console.log('5. Testing API endpoints...');
        
        // Test wallets
        const { data: testWallets, error: testWalletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', actualUserId);
        
        if (testWalletError) {
            console.error('Wallet test error:', testWalletError);
        } else {
            console.log(`✅ Wallet test: ${testWallets.length} wallets found`);
        }
        
        // Test transactions
        const { data: testTx, error: testTxError } = await supabase
            .from('transactions')
            .select('*, categories(name, icon, color), wallets(name, icon)')
            .eq('user_id', actualUserId);
        
        if (testTxError) {
            console.error('Transaction test error:', testTxError);
        } else {
            console.log(`✅ Transaction test: ${testTx.length} transactions found`);
        }
        
        console.log('\n🎉 Demo data fix completed successfully!');
        console.log('\nDemo account details:');
        console.log('Email: demo@example.com');
        console.log('Password: demo123');
        console.log(`Wallets: ${testWallets?.length || 0}`);
        console.log(`Transactions: ${testTx?.length || 0}`);
        
    } catch (error) {
        console.error('❌ Error fixing demo data:', error);
        throw error;
    }
}

if (require.main === module) {
    fixDemoData()
        .then(() => {
            console.log('✅ Script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { fixDemoData };