import { getLocale } from "gt-next/server";

import frContent from "@/catalog/fr/content.json";
import frLabels from "@/catalog/fr/labels.json";
import idContent from "@/catalog/id/content.json";
import idLabels from "@/catalog/id/labels.json";
import jaContent from "@/catalog/ja/content.json";
import jaLabels from "@/catalog/ja/labels.json";
import koContent from "@/catalog/ko/content.json";
import koLabels from "@/catalog/ko/labels.json";
import { translateCatalogText } from "@/lib/catalog";
import type { Catalog } from "@/lib/catalog/types";
import { sanitizeShopifyHtml } from "@/lib/shopify/html/server";

// Merchant copy translated by `pnpm translate` from `pnpm catalog:export`.
const catalogs: Record<string, { content: Catalog; labels: Catalog }> = {
  fr: { content: frContent, labels: frLabels },
  id: { content: idContent, labels: idLabels },
  ja: { content: jaContent, labels: jaLabels },
  ko: { content: koContent, labels: koLabels },
};

/** Short labels (titles, option names and values, alt text) for client components such as the cart. */
export function getCatalogLabels(locale: string): Catalog {
  return catalogs[locale]?.labels ?? {};
}

/** Returns a translator for Shopify merchant text in the request's locale. */
export async function getCatalogText() {
  const catalog = catalogs[await getLocale()];
  const merged: Catalog = catalog ? { ...catalog.content, ...catalog.labels } : {};
  function ct(text: string): string;
  function ct(text: string | undefined): string | undefined;
  function ct(text: string | undefined) {
    return translateCatalogText(merged, text);
  }
  return ct;
}

/** Translates sanitized Shopify rich text (descriptions, page bodies) and sanitizes the result again. */
export async function getCatalogHtml() {
  const content = catalogs[await getLocale()]?.content ?? {};
  return (html: string) => {
    const translated = translateCatalogText(content, html);
    return translated === html ? html : sanitizeShopifyHtml(translated);
  };
}
