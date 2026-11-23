// lib/supabase/admin.ts

import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/supabase";

const AdminEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

/**
 * Клиент с секретным ключом: обходит RLS.
 * Только для серверных задач без входа админа (cron). Никогда в браузер.
 */
export function createAdminClient() {
  const env = AdminEnvSchema.parse(process.env);

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
