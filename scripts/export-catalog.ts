// Exports the store's English merchant copy for `pnpm translate`: short labels to catalog/en/labels.json
// (shipped to the browser for the cart and search) and descriptions and page bodies to catalog/en/content.json.
// Keys are the source text itself, with rich text sanitized as the storefront renders it,
// so anything edited in Shopify after the last export falls back to its live English copy.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";

import { createShopifyRequestContext, createStorefrontClient, gql } from "@shopify/hydrogen";

import { sanitizeShopifyHtml } from "../lib/shopify/html/server.ts";
import type { ResultOf } from "../lib/shopify/types.ts";

const CATALOG_EXPORT_QUERY = gql(`#graphql
  query CatalogExport($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    products(first: 250) {
      nodes {
        title
        productType
        description
        descriptionHtml
        options {
          name
          optionValues {
            name
          }
        }
        images(first: 50) {
          nodes {
            altText
          }
        }
      }
    }
    collections(first: 250) {
      nodes {
        title
        description
        descriptionHtml
        products(first: 1) {
          filters {
            label
            values {
              label
            }
          }
        }
      }
    }
    search(query: "", first: 1) {
      productFilters {
        label
        values {
          label
        }
      }
    }
    pages(first: 250) {
      nodes {
        title
        body
      }
    }
    shop {
      privacyPolicy {
        title
      }
      refundPolicy {
        title
      }
      shippingPolicy {
        title
      }
      subscriptionPolicy {
        title
      }
      termsOfService {
        title
      }
    }
  }
`);

const env: Record<string, string | undefined> = {
  ...parseEnv(await readFile(new URL("../.env.local", import.meta.url), "utf8").catch(() => "")),
  ...process.env,
};
const storeDomain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const publicStorefrontToken = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
if (!storeDomain || !publicStorefrontToken) {
  throw new Error(
    "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
  );
}

const storefront = createStorefrontClient({
  config: { apiVersion: env.SHOPIFY_API_VERSION, publicStorefrontToken, storeDomain },
  requestContext: createShopifyRequestContext({
    i18n: { country: "US", language: "EN" },
    request: new Request(`https://${storeDomain}`),
  }),
  type: "public",
});
const { data, errors } = await storefront.graphql(CATALOG_EXPORT_QUERY);
if (errors?.length || !data)
  throw new Error(errors?.[0]?.message ?? "Catalog export returned no data.");
const catalog = data as ResultOf<typeof CATALOG_EXPORT_QUERY>;

const labels = new Set<string>();
const content = new Set<string>();
for (const product of catalog.products.nodes) {
  labels.add(product.title).add(product.productType);
  content.add(product.description).add(sanitizeShopifyHtml(product.descriptionHtml));
  for (const image of product.images.nodes) if (image.altText) labels.add(image.altText);
  for (const option of product.options) {
    labels.add(option.name);
    for (const value of option.optionValues) labels.add(value.name);
  }
}
for (const collection of catalog.collections.nodes) {
  labels.add(collection.title);
  content.add(collection.description).add(sanitizeShopifyHtml(collection.descriptionHtml));
}
// Search & Discovery filter labels, shown in collection and search filters.
const filters = [
  ...catalog.search.productFilters,
  ...catalog.collections.nodes.flatMap((collection) => collection.products.filters),
];
for (const filter of filters) {
  labels.add(filter.label);
  for (const value of filter.values) labels.add(value.label);
}
for (const page of catalog.pages.nodes) {
  labels.add(page.title);
  content.add(sanitizeShopifyHtml(page.body));
}
for (const policy of Object.values(catalog.shop)) if (policy) labels.add(policy.title);

async function writeCatalog(file: string, texts: Set<string>): Promise<number> {
  const entries = [...texts].filter((text) => text.trim()).sort((a, b) => a.localeCompare(b, "en"));
  await writeFile(
    new URL(`../catalog/en/${file}`, import.meta.url),
    `${JSON.stringify(Object.fromEntries(entries.map((text) => [text, text])), null, 2)}\n`,
  );
  return entries.length;
}

await mkdir(new URL("../catalog/en/", import.meta.url), { recursive: true });
const labelCount = await writeCatalog("labels.json", labels);
const contentCount = await writeCatalog("content.json", content);
console.log(`Exported ${labelCount} labels and ${contentCount} rich-text entries to catalog/en/`);
