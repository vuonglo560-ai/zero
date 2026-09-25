/**
 * Supabase Client & Storage Module
 * Hỗ trợ kết nối Cloud Database và Cloud Storage của Supabase
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Hàm đọc từ Secret Files hoặc Environment Variables
function getEnvOrSecret(envName, secretPath) {
  // 1. Thử đọc từ Environment Variable trước
  if (process.env[envName]) {
    return process.env[envName];
  }
  
  // 2. Thử đọc từ Secret File (Render)
  try {
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, 'utf8').trim();
    }
  } catch (err) {
    // Ignore file read errors
  }
  
  return null;
}

const SUPABASE_URL = getEnvOrSecret('SUPABASE_URL', '/etc/secrets/SUPABASE_URL');
const SUPABASE_SERVICE_KEY = getEnvOrSecret('SUPABASE_SERVICE_ROLE_KEY', '/etc/secrets/SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = getEnvOrSecret('SUPABASE_ANON_KEY', '/etc/secrets/SUPABASE_ANON_KEY');

const SUPABASE_KEY = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
    // Realtime enabled by default với Node.js 22+
  });
  console.log('⚡ Đã kết nối Supabase Cloud Client:', SUPABASE_URL);
  console.log('🔑 Sử dụng key type:', SUPABASE_SERVICE_KEY ? 'SERVICE_ROLE' : 'ANON');
  console.log('📡 Realtime: ENABLED (Node.js 22+ WebSocket support)');
} else {
  console.error('❌ THIẾU Supabase config!');
  console.log('📍 SUPABASE_URL:', SUPABASE_URL ? '✅ OK' : '❌ Missing');
  console.log('📍 SUPABASE_KEY:', SUPABASE_KEY ? '✅ OK' : '❌ Missing');
  console.log('📍 ENV vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  console.log('📍 Secret files check...');
  ['/etc/secrets/SUPABASE_URL', '/etc/secrets/SUPABASE_ANON_KEY', '/etc/secrets/SUPABASE_SERVICE_ROLE_KEY'].forEach(p => {
    console.log(`   ${p}:`, fs.existsSync(p) ? '✅ EXISTS' : '❌ NOT FOUND');
  });
}

/**
 * Upload file CSV hoặc tài liệu lên Supabase Cloud Storage bucket
 * @param {string} bucketName - Tên bucket (mặc định 'spendwise-storage')
 * @param {string} filePath - Đường dẫn lưu trữ trên cloud (ví dụ: 'exports/transactions_2026.csv')
 * @param {Buffer|string} fileContent - Nội dung tệp
 * @param {string} contentType - MIME type (ví dụ: 'text/csv')
 */
async function uploadToSupabaseStorage(bucketName = 'spendwise-storage', filePath, fileContent, contentType = 'text/csv') {
  if (!supabase) {
    throw new Error('Supabase client chưa được cấu hình. Vui lòng kiểm tra SUPABASE_URL và SUPABASE_KEY.');
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileContent, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error('❌ Lỗi upload lên Supabase Storage:', error);
    throw error;
  }

  // Lấy Public URL của tệp
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl
  };
}

module.exports = {
  supabase,
  uploadToSupabaseStorage
};
