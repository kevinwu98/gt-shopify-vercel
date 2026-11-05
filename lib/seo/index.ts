import { getLocale } from "gt-next/server";
import type { Metadata } from "next";

import { shopConfig } from "@/lib/config";
import { localizePath, locales } from "@/lib/i18n";

import type { SearchParamsInput } from "./types";

function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withLeadingSlash === "/") return withLeadingSlash;
  return withLeadingSlash.replace(/\/+$/, "");
}

function toSearchParams(input: SearchParamsInput): URLSearchParams {
  if (!input) return new URLSearchParams();
  if (input instanceof URLSearchParams) return new URLSearchParams(input);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      if (key.startsWith("filter.")) {
        if (value.length > 0) params.set(key, value.join(","));
      } else {
        for (const item of value) {
          params.append(key, item);
        }
      }
      continue;
    }
    params.set(key, value);
  }

  return params;
}

function buildCanonicalPath(pathname: string, searchParams?: SearchParamsInput): string {
  const params = toSearchParams(searchParams);
  params.delete("cursor");

  const query = params.toString();
  const normalizedPath = normalizePath(pathname);
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

/** Canonical URL for the request's locale, plus hreflang alternates for every locale. */
export async function buildAlternates({
  pathname,
  searchParams,
}: {
  pathname: string;
  searchParams?: SearchParamsInput;
}): Promise<Metadata["alternates"]> {
  const canonicalPath = buildCanonicalPath(pathname, searchParams);
  const locale = await getLocale();
  return {
    canonical: localizePath(canonicalPath, locale),
    languages: {
      ...Object.fromEntries(locales.map((code) => [code, localizePath(canonicalPath, code)])),
      "x-default": canonicalPath,
    },
  };
}

export async function buildOpenGraph({
  title,
  description,
  url,
  type,
  images = ["/og-default.png"],
}: {
  title: string;
  description?: string;
  url: string;
  type?: "website" | "article";
  images?: Array<
    | string
    | {
        url: string;
        width?: number;
        height?: number;
        alt?: string;
      }
  >;
}): Promise<Metadata["openGraph"]> {
  const locale = await getLocale();
  // Omit type so product pages can emit og:type=product through raw meta tags.
  return {
    ...(type ? { type } : {}),
    title,
    description,
    url: localizePath(url, locale),
    locale,
    alternateLocale: locales.filter((code) => code !== locale),
    siteName: shopConfig.site.name,
    images,
  };
}
