export interface NavLink {
  href: string;
  label: string;
  // Префикс детальных страниц раздела: на них пункт меню тоже подсвечивается
  activePrefix?: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/stores", label: "All Stores", activePrefix: "/store/" },
  { href: "/categories", label: "Categories", activePrefix: "/category/" },
  { href: "/brands", label: "Brands", activePrefix: "/brand/" },
  { href: "/guides", label: "Guides", activePrefix: "/guides/" },
  { href: "/sales-calendar", label: "Calendar" },
];
