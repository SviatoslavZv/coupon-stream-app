// lib/actions/quick-add.ts

"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_ROUTES, withQuery } from "@/lib/constants/admin";
import { resolveQuickAdd } from "@/lib/quick-add";
import { STORE_PRODUCT_PREFILL_PARAMS } from "@/lib/schemas/store-products";
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

  switch (target.kind) {
    case "amazon":
      redirect(ADMIN_ROUTES.amazonLink(target.asin));
    case "store":
      redirect(
        withQuery(ADMIN_ROUTES.storeProductNew, {
          [STORE_PRODUCT_PREFILL_PARAMS.store]: target.store.id,
          [STORE_PRODUCT_PREFILL_PARAMS.url]: target.productUrl,
        }),
      );
    case "error":
      return { error: target.message };
  }
}
