"use client";

import { createContext, type ReactNode, use } from "react";

import { translateCatalogText } from "@/lib/catalog";
import type { Catalog } from "@/lib/catalog/types";

const CatalogContext = createContext<Catalog>({});

export function CatalogProvider({ labels, children }: { labels: Catalog; children: ReactNode }) {
  return <CatalogContext value={labels}>{children}</CatalogContext>;
}

/** Translates Shopify merchant labels (product titles, option names and values) on the client. */
export function useCatalogText() {
  const catalog = use(CatalogContext);
  function ct(text: string): string;
  function ct(text: string | undefined): string | undefined;
  function ct(text: string | undefined) {
    return translateCatalogText(catalog, text);
  }
  return ct;
}
