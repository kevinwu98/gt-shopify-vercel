import type { Catalog } from "@/lib/catalog/types";

/** Looks up merchant text by its live English source and falls back to it when no translation exists. */
export function translateCatalogText(catalog: Catalog, text: string): string;
export function translateCatalogText(
  catalog: Catalog,
  text: string | undefined,
): string | undefined;
export function translateCatalogText(catalog: Catalog, text: string | undefined) {
  return (text && catalog[text]) || text;
}
