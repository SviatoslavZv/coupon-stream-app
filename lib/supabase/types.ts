// lib/supabase/types.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * A Supabase client that knows our tables. Use it for function parameters:
 * a bare SupabaseClient knows no tables, so every query result would be untyped again.
 */
export type TypedSupabaseClient = SupabaseClient<Database>;
