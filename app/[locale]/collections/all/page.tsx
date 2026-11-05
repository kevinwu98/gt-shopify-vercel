import type { Metadata } from "next";

import { CollectionResults } from "@/components/collections/browse";
import {
  CollectionBrowseBoundary,
  SearchParamsProbe,
} from "@/components/collections/collection-page";
import { getAllProductsMetadata, getAllProductsResults } from "@/lib/collections/server";
import { getRequestCommerceLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return getAllProductsMetadata();
}

export default function AllProductsPage({ searchParams }: PageProps<"/[locale]/collections/all">) {
  return (
    <CollectionBrowseBoundary>
      <CollectionResults
        results={getRequestCommerceLocale().then((locale) => getAllProductsResults({ locale }))}
      />
      <SearchParamsProbe searchParams={searchParams} />
    </CollectionBrowseBoundary>
  );
}
