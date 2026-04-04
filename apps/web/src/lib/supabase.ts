import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@aerofocus/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? SUPABASE_ANON_KEY;

if (!supabaseUrl) {
	throw new Error("supabaseUrl is required.");
}

if (!supabaseAnonKey) {
	throw new Error("supabaseKey is required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
