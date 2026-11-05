import { notFound } from "next/navigation";

import { shopConfig } from "@/lib/config";
import { localizePath, locales } from "@/lib/i18n";
import { getShopPolicies } from "@/lib/policies/server";
import { getShopifySitemapPage, getShopifySitemapPagesCount } from "@/lib/seo/server";
import { type ShopifySitemapType } from "@/lib/shopify/operations/sitemap/types";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toAbsoluteUrl(pathname: string): string {
  return `${shopConfig.site.url}${pathname}`;
}

// One <url> per locale, each listing every translation as an hreflang alternate.
function urlEntries(pathname: string, lastmod?: string): string {
  const alternates = [
    ...locales.map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(toAbsoluteUrl(localizePath(pathname, locale)))}"/>`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(toAbsoluteUrl(pathname))}"/>`,
  ].join("\n");
  return locales
    .map((locale) => {
      const loc = escapeXml(toAbsoluteUrl(localizePath(pathname, locale)));
      const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
      return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n${alternates}\n  </url>`;
    })
    .join("\n");
}

function urlsetWrap(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

async function renderStatic(): Promise<Response> {
  const policies = await getShopPolicies().catch(() => []);
  const entries = ["/", ...policies.map(({ handle }) => `/policies/${handle}`)]
    .map((pathname) => urlEntries(pathname))
    .join("\n");
  return xmlResponse(urlsetWrap(entries));
}

async function renderShard(
  type: ShopifySitemapType,
  page: number,
  segment: string,
): Promise<Response> {
  if (page < 1 || page > (await getShopifySitemapPagesCount(type))) notFound();
  const { items } = await getShopifySitemapPage(type, page);

  const entries = items
    .map((item) => urlEntries(item.pathname ?? `/${segment}/${item.handle}`, item.updatedAt))
    .join("\n");

  return xmlResponse(urlsetWrap(entries));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shard: string }> },
): Promise<Response> {
  const { shard } = await params;
  const id = shard.endsWith(".xml") ? shard.slice(0, -".xml".length) : shard;

  if (id === "static") return renderStatic();

  const match = id.match(/^(articles|blogs|collections|pages|products)-(\d+)$/);
  if (!match) notFound();

  const segment = match[1];
  const types: Record<string, ShopifySitemapType> = {
    articles: "ARTICLE",
    blogs: "BLOG",
    collections: "COLLECTION",
    pages: "PAGE",
    products: "PRODUCT",
  };
  const type = types[segment];
  if (!type) notFound();

  return renderShard(type, Number(match[2]), segment);
}
