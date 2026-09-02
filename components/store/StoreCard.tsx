"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/types";

export default function StoreCard({ store }: { store: Store }) {
  const [imgError, setImgError] = useState(false);

  // Берём первую букву названия магазина для заглушки
  const firstLetter = store.name ? store.name.charAt(0).toUpperCase() : "S";

  return (
    <Link
      href={`/store/${store.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-md"
    >
      <div className="flex items-center justify-between p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper">
          {store.logoUrl && !imgError ? (
            <Image
              src={store.logoUrl}
              alt={`${store.name} logo`}
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            /* 🔥 Красивый фоллбэк с первой буквой магазина */
            <span className="font-display text-lg font-bold text-ink/60">
              {firstLetter}
            </span>
          )}
        </div>

        <span className="font-mono text-xs text-ink/80">
          {store.offerCount > 0 ? `${store.offerCount} offers` : "No offers"}
        </span>
      </div>

      <div className="px-5 pb-4">
        <h2 className="font-display text-lg font-bold text-ink">
          {store.name}
        </h2>
        <p
          className={
            store.offerCount > 0
              ? "text-sm font-medium text-coupon-dark"
              : "text-sm font-medium text-ink/40"
          }
        >
          {store.offerCount > 0 ? store.bestOffer : "Check back soon"}
        </p>
      </div>

      <div
        className="h-2 w-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 6px 6px, transparent 6px, var(--color-line) 6px)",
          backgroundSize: "12px 12px",
          backgroundPosition: "bottom",
        }}
        aria-hidden="true"
      />
    </Link>
  );
}