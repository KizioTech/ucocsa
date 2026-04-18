import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY // Wait, to create a bucket we need service_role key OR we can just try to see if it exists
);

async function checkBucket() {
  const { data, error } = await supabaseAdmin.storage.getBucket('gallery');
  console.log("Gallery Bucket Check:", data, error);
}

checkBucket();
