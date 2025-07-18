import { supabase } from './supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const { data, error } = await supabase
    .from('users')
    .insert([
      { name: 'John Doe', email: 'john.doe@example.com' },
      { name: 'Jane Doe', email: 'jane.doe@example.com' },
    ]);

  if (error) {
    console.error('Error creating users table:', error);
  } else {
    console.log('Users table created and seeded successfully:', data);
  }
}

setupDatabase();
