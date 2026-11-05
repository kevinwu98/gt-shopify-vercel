import { useLocale } from "gt-next";

import { shopConfig } from "@/lib/config";
import { localizePath } from "@/lib/i18n";

interface BreadcrumbSchemaItem {
  name: string;
  path: string;
}

function toAbsoluteUrl(path: string, locale: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${shopConfig.site.url}${localizePath(path, locale)}`;
}

// Item names arrive in the page's locale; URLs point at the same locale's pages.
export function BreadcrumbSchema({ items }: { items: BreadcrumbSchemaItem[] }) {
  const locale = useLocale();
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path, locale),
    })),
  };

  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}
