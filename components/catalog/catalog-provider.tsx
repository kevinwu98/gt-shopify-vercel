"use client";

import { createContext, use, type ReactNode } from "react";

import { type Catalog, translateCatalogText } from "@/lib/catalog/text";

const CatalogContext = createContext<Catalog>({});

export function CatalogProvider({ labels, children }: { labels: Catalog; children: ReactNode }) {
  return <CatalogContext value={labels}>{children}</CatalogContext>;
}

/** Translates Shopify merchant labels (product titles, option names and values) on the client. */
export function useCatalogText() {
  const catalog = use(CatalogContext);
  return <Text extends string | undefined>(text: Text) =>
    translateCatalogText(catalog, text) as Text;
}
