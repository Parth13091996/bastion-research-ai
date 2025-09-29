const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Role Key is not set in the environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addNewsletterCategoryColumn() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS category TEXT;'
    });

    if (error) {
      console.error('Error adding column:', error);
      process.exit(1);
    }

    console.log('Category column added successfully to newsletters table.');
  } catch (err) {
    console.error('Failed to add column:', err);
    process.exit(1);
  }
}

addNewsletterCategoryColumn();
