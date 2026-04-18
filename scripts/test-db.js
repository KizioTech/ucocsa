import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testFetch() {
  console.log("Fetching gallery_albums as ANON...");
  const { data: albumsData, error: albumsError } = await supabase
    .from("gallery_albums")
    .select("*, gallery_photos(count)")
    .eq("is_published", true);
    
  console.log("Albums:", albumsData, albumsError);

  console.log("Fetching gallery_photos as ANON...");
  const { data: photosData, error: photosError } = await supabase
    .from("gallery_photos")
    .select("*");
    
  console.log("Photos:", photosData, photosError);
}

testFetch();
