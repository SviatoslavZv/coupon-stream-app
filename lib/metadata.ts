// lib/metadata.ts

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants/site";

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const absoluteUrl = `${SITE_URL}${cleanPath}`;

  return {
    title,
    description,

    alternates: {
      canonical: absoluteUrl,
    },

    openGraph: {
      title,
      description,
      url: absoluteUrl, // Важно: здесь тоже должен быть абсолютный URL
      siteName: "CouponCreek",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function notFoundMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
