// lib/actions/quick-add.ts

"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { quickAddHref, resolveQuickAdd } from "@/lib/quick-add";
import { getDeepLinkStores } from "@/lib/stores";
import type { FormState } from "@/types";

const QUICK_ADD_FIELD = "q";

/** One box for everything: sends the pasted value to the right import form. */
export async function quickAdd(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const raw = formData.get(QUICK_ADD_FIELD);
  const target = resolveQuickAdd(
    typeof raw === "string" ? raw : "",
    await getDeepLinkStores(),
  );

  if (target.kind === "error") {
    return { error: target.message };
  }
  redirect(quickAddHref(target));
}
