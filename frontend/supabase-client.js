
const SUPABASE_URL = "https://zktjonikypcjnxvkfqdc.supabase.co";

// Ganti teks di bawah dengan Publishable key milikmu
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RoRt8GFzai9b4UnEKKeFtg_QA58-4_d";

window.sakuraSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

