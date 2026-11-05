import { useLocale } from "gt-next";

import { shopConfig } from "@/lib/config";
import { localizePath } from "@/lib/i18n";

interface CollectionSchemaData {
  handle: string;
  title: string;
  description: string;
  updatedAt?: string;
}

// Title and description arrive in the page's locale.
export function CollectionSchema({ collection }: { collection: CollectionSchemaData }) {
  const locale = useLocale();
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description || undefined,
    inLanguage: locale,
    url: `${shopConfig.site.url}${localizePath(`/collections/${collection.handle}`, locale)}`,
    dateModified: collection.updatedAt,
  };

  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}
