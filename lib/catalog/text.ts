export type Catalog = Readonly<Record<string, string>>;

export function translateCatalogText(catalog: Catalog, text: string): string;
export function translateCatalogText(
  catalog: Catalog,
  text: string | undefined,
): string | undefined;
export function translateCatalogText(catalog: Catalog, text: string | undefined) {
  return (text && catalog[text]) || text;
}
