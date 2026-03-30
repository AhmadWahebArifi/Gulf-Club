import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
