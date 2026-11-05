import french from "@/catalog/fr.json";
import indonesian from "@/catalog/id.json";
import japanese from "@/catalog/ja.json";
import korean from "@/catalog/ko.json";
import type { Catalog } from "@/lib/catalog/text";

// Merchant copy translated by `pnpm translate`. Keys are the English text exported from Shopify,
// so anything edited in Shopify after the last export falls back to its live English copy.
const catalogs: Record<string, Catalog> = { fr: french, ja: japanese, ko: korean, id: indonesian };

export function getCatalog(locale: string): Catalog {
  return catalogs[locale] ?? {};
}

/** Short labels (titles, option names and values) for client components such as the cart. */
export function getCatalogLabels(locale: string): Catalog {
  return Object.fromEntries(
    Object.entries(getCatalog(locale)).filter(([english]) => !english.includes("</")),
  );
}
