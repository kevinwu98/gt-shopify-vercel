import { getLocale } from "gt-next/server";

import { getCatalog } from "@/lib/catalog";
import { translateCatalogText } from "@/lib/catalog/text";
import { sanitizeShopifyHtml } from "@/lib/shopify/html/server";

/** Returns a translator for Shopify merchant copy in the request's locale. */
export async function getCatalogText() {
  const catalog = getCatalog(await getLocale());
  return <Text extends string | undefined>(text: Text) =>
    translateCatalogText(catalog, text) as Text;
}

/** Translates sanitized Shopify rich text (descriptions, page bodies) and sanitizes the result again. */
export async function getCatalogHtml() {
  const catalog = getCatalog(await getLocale());
  return (html: string) => {
    const translated = translateCatalogText(catalog, html);
    return translated === html ? html : sanitizeShopifyHtml(translated);
  };
}
