import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testUpload() {
  const fileContent = "This is a test text file";
  const path = `test-folder/test-${Date.now()}.txt`;
  
  // We need to use service_role key to bypass RLS in the script or login
  // Wait, I only have PUBLISHABLE_KEY. The publishable key is ANON.
  // I cannot upload as ANON because of RLS: TO authenticated.
  // Unless I can sign in...
  
  console.log("Using anon key, upload should fail with RLS error.");
  const { data, error } = await supabase.storage.from("gallery").upload(path, fileContent, {
    contentType: 'text/plain'
  });
  console.log("Upload result:", data, error);
}

testUpload();
