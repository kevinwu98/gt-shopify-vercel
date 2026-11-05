import type { ProductRecommendationIntent } from "@shopify/hydrogen/storefront-api-types";
import { cacheLife, cacheTag } from "next/cache";

import { getCatalogHtml, getCatalogText } from "@/lib/catalog/server";
import type { CommerceLocale } from "@/lib/config/types";
import type { ProductCard, ProductDetails, ProductPage } from "@/lib/product/types";
import { getNumericShopifyId } from "@/lib/shopify/id/server";
import {
  fetchProduct,
  fetchProductRecommendations,
  fetchSearchIndexProducts,
} from "@/lib/shopify/operations/products/server";
import type { SearchIndexProductsParams } from "@/lib/shopify/operations/products/types";

// Only valid inside a cache directive scope.
export function tagProducts(products: Array<{ id: string }>): void {
  for (const product of products) {
    const numericId = getNumericShopifyId(product.id);
    if (numericId) cacheTag(`product-${numericId}`);
  }
}

export async function getProduct(params: {
  handle: string;
  locale?: CommerceLocale;
}): Promise<ProductDetails | undefined> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("products", `product-${params.handle}`);

  const product = await fetchProduct(params);
  if (product) tagProducts([product]);
  return product;
}

// Cursor-paginated browse reads stay uncached in lib/collections/server.ts; this serves fixed grids only.
export async function getSearchIndexProducts(
  params: SearchIndexProductsParams,
): Promise<ProductPage> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("products", "products-index");

  const result = await fetchSearchIndexProducts(params);
  tagProducts(result.products);
  return result;
}

export async function getProductRecommendations(params: {
  handle: string;
  intent: ProductRecommendationIntent;
  locale?: CommerceLocale;
}): Promise<ProductCard[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("products", `recommendations-${params.handle}`);

  const products = await fetchProductRecommendations(params);
  tagProducts(products);
  return products;
}

/** Merchant copy for the product page in the request's locale: display, metadata, and structured data. */
export async function getProductCopy(
  product: Pick<ProductDetails, "description" | "descriptionHtml" | "seo" | "title">,
) {
  const ct = await getCatalogText();
  const ch = await getCatalogHtml();
  const description = ct(product.description);
  const descriptionHtml = ch(product.descriptionHtml);
  return {
    description,
    descriptionHtml,
    seo: {
      // Custom SEO copy is not in the catalog; the defaults are the title and description.
      description:
        product.seo.description === product.description ? description : product.seo.description,
      title: ct(product.seo.title),
    },
    title: ct(product.title),
  };
}
