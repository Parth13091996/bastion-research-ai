import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import path from 'path';
import fs from 'fs';

const environment = process.env.APP_ENV || process.env.NODE_ENV || 'development';
const environmentFile = environment === 'production' ? '.env' : `.env.${environment}`;

// Check all possible locations where .env could be placed
const candidatePaths = [
  path.resolve(process.cwd(), environmentFile),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../', environmentFile),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../../', environmentFile),
  path.resolve(__dirname, '../../../../.env'),
  '/root/Documents/bastion-research/apps/server/.env',
  '/root/Documents/bastion-research/.env',
];

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Supabase Init Error] process.cwd():', process.cwd());
  console.error('[Supabase Init Error] Existing env files found:', candidatePaths.filter(p => fs.existsSync(p)));
  throw new Error('Supabase URL or Service Role Key is not set in the environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
