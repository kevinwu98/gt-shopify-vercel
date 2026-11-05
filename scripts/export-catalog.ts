// Exports the storefront's English merchant copy to catalog/en.json for `gt translate`.
// Keys are the English text itself (rich text sanitized as the storefront renders it),
// so anything edited in Shopify after the last export falls back to its live English copy.
import { readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";

import { sanitizeShopifyHtml } from "../lib/shopify/html/server.ts";

const env: Record<string, string | undefined> = {
  ...parseEnv(await readFile(new URL("../.env.local", import.meta.url), "utf8").catch(() => "")),
  ...process.env,
};
const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
if (!domain || !token)
  throw new Error(
    "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
  );

const query = `query CatalogExport @inContext(language: EN) {
  products(first: 250) {
    nodes {
      title productType descriptionHtml
      options { name optionValues { name } }
      images(first: 50) { nodes { altText } }
    }
  }
  collections(first: 250) {
    nodes { title descriptionHtml products(first: 1) { filters { label values { label } } } }
  }
  search(query: "", first: 1) { productFilters { label values { label } } }
  pages(first: 250) { nodes { title body } }
  shop {
    privacyPolicy { title }
    refundPolicy { title }
    shippingPolicy { title }
    termsOfService { title }
    subscriptionPolicy { title }
  }
}`;

const response = await fetch(`https://${domain}/api/2026-10/graphql.json`, {
  body: JSON.stringify({ query }),
  headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
  method: "POST",
});
// oxlint-disable-next-line typescript/no-explicit-any -- untyped Storefront API response
const { data, errors }: { data: any; errors?: unknown } = await response.json();
if (errors) throw new Error(JSON.stringify(errors));

const texts = new Set<string>();
for (const product of data.products.nodes) {
  texts
    .add(product.title)
    .add(product.productType)
    .add(sanitizeShopifyHtml(product.descriptionHtml));
  for (const image of product.images.nodes) if (image.altText) texts.add(image.altText);
  for (const option of product.options) {
    texts.add(option.name);
    for (const value of option.optionValues) texts.add(value.name);
  }
}
// Search & Discovery filter labels, shown in collection and search filters.
const filters = [
  ...data.search.productFilters,
  ...data.collections.nodes.flatMap((collection) => collection.products.filters),
];
for (const collection of data.collections.nodes)
  texts.add(collection.title).add(sanitizeShopifyHtml(collection.descriptionHtml));
for (const filter of filters) {
  texts.add(filter.label);
  for (const value of filter.values) texts.add(value.label);
}
for (const policy of Object.values(data.shop)) if (policy) texts.add(policy.title);
for (const page of data.pages.nodes) texts.add(page.title).add(sanitizeShopifyHtml(page.body));

const entries = [...texts].filter((text) => text?.trim()).sort((a, b) => a.localeCompare(b, "en"));
await writeFile(
  new URL("../catalog/en.json", import.meta.url),
  `${JSON.stringify(Object.fromEntries(entries.map((text) => [text, text])), null, 2)}\n`,
);
console.log(`Exported ${entries.length} catalog strings to catalog/en.json`);
