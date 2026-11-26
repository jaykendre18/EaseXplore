import { createClient } from '@supabase/supabase-js';

// Both values come from your Supabase project and are stored in a local `.env`
// file (see `.env.example` and SUPABASE_SETUP.md).
//
// The key is Supabase's public "publishable" key (it starts with sb_publishable_).
// Older projects use the legacy "anon" key, which is still accepted here until
// Supabase retires it. Both are safe in the browser: access to data is protected
// by Row Level Security rules in the database, never by hiding this key.
// NEVER put a "secret" or "service_role" key in this project.
const url = import.meta.env.VITE_SUPABASE_URL;
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && publicKey);

// When the keys are missing the client is null. The site still runs and shows
// logged-out screens, so the design can be previewed before connecting Supabase.
export const supabase = isSupabaseConfigured ? createClient(url, publicKey) : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[EaseXplore] Supabase is not configured. Copy .env.example to .env and add your project URL and publishable key to turn on login and saved data.',
  );
}
