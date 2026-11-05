import { getGT } from "gt-next/server";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { getCatalogText } from "@/lib/catalog/server";
import { describeCollection, PRODUCTS_PER_PAGE, resolveBrowseParams } from "@/lib/collections";
import type {
  BrowseResults,
  BrowseState,
  Collection,
  CollectionWithThumbnail,
} from "@/lib/collections/types";
import { shopConfig } from "@/lib/config";
import type { CommerceLocale } from "@/lib/config/types";
import { getRequestCommerceLocale } from "@/lib/i18n/server";
import { tagProducts } from "@/lib/product/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { getNumericShopifyId } from "@/lib/shopify/id/server";
import {
  fetchCollection,
  fetchCollections,
  fetchCollectionsListing,
} from "@/lib/shopify/operations/collections/server";
import {
  fetchCollectionProducts,
  fetchSearchFacets,
  fetchSearchIndexProducts,
} from "@/lib/shopify/operations/products/server";

// /collections/all is a local virtual collection with no Storefront API equivalent.
export const ALL_PRODUCTS_HANDLE = "all";

// Delete payloads carry only the ID and renames only the new handle, so cached reads carry both tags.
function tagCollections(collections: Array<{ handle: string; id?: string }>): void {
  for (const collection of collections) {
    cacheTag(`collection-${collection.handle}`);
    const numericId = collection.id ? getNumericShopifyId(collection.id) : null;
    if (numericId) cacheTag(`collection-${numericId}`);
  }
}

export async function getCollections(
  params: { limit?: number; locale?: CommerceLocale } = {},
): Promise<Collection[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("collections", "collections-index");

  const collections = await fetchCollections(params);
  tagCollections(collections);
  return collections;
}

export async function getCollection(params: {
  handle: string;
  locale?: CommerceLocale;
}): Promise<Collection | undefined> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("collections", `collection-${params.handle}`);

  const collection = await fetchCollection(params);
  if (collection) tagCollections([collection]);
  return collection;
}

export async function getCollectionsListing(
  params: { limit?: number; locale?: CommerceLocale } = {},
): Promise<CollectionWithThumbnail[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("collections", "collections-index");

  const collections = await fetchCollectionsListing(params);
  tagCollections(collections);
  // Thumbnails fall back to product imagery, so product updates must refresh the listing.
  tagProducts(
    collections.flatMap((collection) =>
      collection.thumbnailProductId ? [{ id: collection.thumbnailProductId }] : [],
    ),
  );
  return collections;
}

export async function readBrowseState(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
): Promise<BrowseState> {
  return resolveBrowseParams(recordToSearchParams(await searchParamsPromise));
}

function recordToSearchParams(
  record: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  return params;
}

// The default view, unfiltered and in its default sort: Search & Discovery edits send no webhook, so they appear once a product or collection webhook refreshes it, and Load more's product dedupe absorbs cursor drift.
export async function getCollectionResults(params: {
  handle: string;
  locale?: CommerceLocale;
}): Promise<BrowseResults> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("collections", `collection-${params.handle}`, "products-index");

  const { facets, pageInfo, products } = await fetchCollectionProducts({
    collection: params.handle,
    limit: PRODUCTS_PER_PAGE,
    locale: params.locale,
  });
  tagProducts(products);
  return {
    dataSearch: "",
    facets,
    pageInfo,
    products,
    source: { collection: params.handle, type: "collection" },
  };
}

export async function getAllProductsResults(
  params: { locale?: CommerceLocale } = {},
): Promise<BrowseResults> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("products-index");

  const [{ pageInfo, products }, { facets, total }] = await Promise.all([
    fetchSearchIndexProducts({ limit: PRODUCTS_PER_PAGE, locale: params.locale }),
    fetchSearchFacets({ locale: params.locale }),
  ]);
  tagProducts(products);
  return { dataSearch: "", facets, pageInfo, products, source: { type: "search" }, total };
}

// Filtered and sorted views stay live; a cache entry per combination would rarely be reused.
export async function fetchCollectionResults({
  handle,
  locale,
  statePromise,
}: {
  handle: string;
  locale: CommerceLocale;
  statePromise: Promise<BrowseState>;
}): Promise<BrowseResults> {
  const { dataSearch, filters, sort } = await statePromise;
  const { facets, pageInfo, products } = await fetchCollectionProducts({
    collection: handle,
    filters,
    limit: PRODUCTS_PER_PAGE,
    locale,
    sortKey: sort,
  });
  return {
    dataSearch,
    facets,
    pageInfo,
    products,
    source: { collection: handle, type: "collection" },
  };
}

// The Markdown surface renders outside the [locale] route, so it reads this source copy.
export async function getAllProductsCollection(): Promise<Collection> {
  const title = "Products";
  const description = "";
  return {
    handle: ALL_PRODUCTS_HANDLE,
    title,
    description,
    image: null,
    path: `/collections/${ALL_PRODUCTS_HANDLE}`,
    seo: {
      description: `Browse every product at ${shopConfig.site.name}: compare prices and check availability.`,
      title,
    },
  };
}

/** /collections/all in the request's locale, for the storefront page and its metadata. */
export async function getLocalizedAllProductsCollection(): Promise<Collection> {
  const gt = await getGT();
  const collection = await getAllProductsCollection();
  const title = gt("Products");
  return {
    ...collection,
    title,
    seo: {
      description: gt(
        "Browse every product at {siteName}: compare prices and check availability.",
        { siteName: shopConfig.site.name },
      ),
      title,
    },
  };
}

async function browseMetadata(
  handle: string,
  title: string,
  description: string,
): Promise<Metadata> {
  const url = `/collections/${handle}`;
  return {
    title,
    description,
    alternates: await buildAlternates({ pathname: url }),
    openGraph: await buildOpenGraph({ title, description, url, type: "website" }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  };
}

export async function getCollectionMetadata(handle: string): Promise<Metadata> {
  const gt = await getGT();
  const [ct, collection] = await Promise.all([
    getCatalogText(),
    getCollection({ handle, locale: await getRequestCommerceLocale() }),
  ]);
  if (!collection) {
    return browseMetadata(handle, gt("Collection"), gt("Browse collection products."));
  }
  const title = ct(collection.title);
  const localized = {
    ...collection,
    description: ct(collection.description),
    seo: {
      description: ct(collection.seo.description),
      title: ct(collection.seo.title),
    },
    title,
  };
  return browseMetadata(
    collection.handle,
    localized.seo.title,
    describeCollection(
      localized,
      gt("Shop {title} at {siteName}: browse products, compare prices, and check availability.", {
        siteName: shopConfig.site.name,
        title,
      }),
    ),
  );
}

export async function getAllProductsMetadata(): Promise<Metadata> {
  const collection = await getLocalizedAllProductsCollection();
  return browseMetadata(ALL_PRODUCTS_HANDLE, collection.title, describeCollection(collection));
}
