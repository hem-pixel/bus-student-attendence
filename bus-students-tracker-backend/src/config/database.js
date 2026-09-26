const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config();

// Supabase Client Setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Optional PostgreSQL Direct Pool (for direct SQL / migrations)
let pgPool = null;
if (process.env.DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

// Diagnostic connection test function
async function testConnection() {
  console.log('--- Testing Database Connection ---');
  try {
    const isPlaceholder = !process.env.SUPABASE_URL || 
                          process.env.SUPABASE_URL.includes('placeholder') || 
                          process.env.SUPABASE_URL.includes('your-project-id') ||
                          process.env.SUPABASE_KEY.includes('your_supabase');

    if (!isPlaceholder) {
      const { data, error } = await supabase.from('users').select('id, email, role').limit(1);
      if (error) {
        console.warn('⚠️ Supabase returned an error (Tables may need to be initialized in Supabase SQL editor):', error.message);
        return { success: false, error: error.message };
      }
      console.log('✅ Supabase database connected successfully! Users count query response received.');
      return { success: true, client: 'supabase' };
    } else {
      console.log('ℹ️ Running with placeholder or local mock configuration. Please update .env with your real Supabase credentials.');
      return { success: true, client: 'mock/placeholder' };
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return { success: false, error: err.message };
  }
}

if (require.main === module) {
  testConnection().then((res) => {
    console.log('Connection test result:', res);
  });
}

module.exports = {
  supabase,
  pgPool,
  testConnection
};
