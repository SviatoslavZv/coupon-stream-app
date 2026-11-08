// app/manifest.ts

import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#FBFAF7",
    theme_color: "#B8291B",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
