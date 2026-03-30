import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;

// Create a dummy client during build time if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  // During build time, create a mock client that won't crash
  console.warn("Supabase environment variables not found. Using mock client for build.");
  
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      upsert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      delete: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signUp: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      }),
    },
  };
} else {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL. Expected a full URL like https://<project-ref>.supabase.co, got: ${supabaseUrl}`,
    );
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL protocol. Expected http/https, got: ${parsedUrl.protocol}`,
    );
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
