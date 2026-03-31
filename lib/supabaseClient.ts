import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only log on client side to avoid hydration errors
if (typeof window !== 'undefined') {
  console.log("🔍 Supabase Debug - Environment Variables:");
  console.log("  URL:", supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "MISSING");
  console.log("  Anon Key:", supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + "..." : "MISSING");
}

let supabase: any;

// Create a dummy client during build time if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  // During build time, create a mock client that won't crash
  if (typeof window !== 'undefined') {
    console.warn("⚠️ Supabase environment variables not found. Using mock client for build.");
    console.warn("  This will cause authentication to fail!");
    console.warn("  Please check your .env.local file for:");
    console.warn("  - NEXT_PUBLIC_SUPABASE_URL");
    console.warn("  - NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  
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
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase not configured - check environment variables") }),
      signUp: () => Promise.resolve({ data: null, error: new Error("Supabase not configured - check environment variables") }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      }),
    },
  };
} else {
  if (typeof window !== 'undefined') {
    console.log("✅ Supabase client initialized with real credentials");
  }
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
