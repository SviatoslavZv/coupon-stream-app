// lib/constants/redirects.ts

/**
 * Store slugs that were renamed: old → new.
 * The old address answers with a permanent redirect, so search rankings and saved links keep working.
 * Never remove an entry: Google and visitors may remember the old address for years.
 */
export const RENAMED_STORE_SLUGS: Readonly<Record<string, string>> = {
  "bloomingdale-s": "bloomingdales",
};
