import { createClient } from "@supabase/supabase-js";
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const supabase = createClient(supabaseURL, supabaseKey);
