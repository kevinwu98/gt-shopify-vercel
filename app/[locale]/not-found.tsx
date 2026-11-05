import { createShopifyRequestContext, handleShopifyRedirects } from "@shopify/hydrogen";
import { T } from "gt-next";
import { headers } from "next/headers";
import { permanentRedirect, redirect } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import {
  defaultLocale,
  getCommerceLocale,
  isSupportedLocale,
  LOCALE_HEADER_NAME,
  localizePath,
  splitLocalePath,
} from "@/lib/i18n";
import { SHOPIFY_ROUTE_TEMPLATES } from "@/lib/shopify/routing";
import { createRequestStorefrontClient } from "@/lib/shopify/storefront/server";

export default function NotFoundError() {
  return (
    <Page className="flex flex-1 flex-col">
      {shopConfig.redirects.shopifyNotFound.isEnabled ? (
        <Suspense fallback={null}>
          <ShopifyNotFoundRedirect />
        </Suspense>
      ) : null}
      <Container className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center text-center gap-2.5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl">
            <T>Page Not Found</T>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl">
            <T>The link may be incorrect, or the page has been removed.</T>
          </p>
          <Link
            href="/search"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <T>Continue Shopping</T>
          </Link>
        </div>
      </Container>
    </Page>
  );
}

async function ShopifyNotFoundRedirect() {
  const requestHeaders = await headers();
  const storefrontUrl = requestHeaders.get("x-storefront-url");
  if (!storefrontUrl) return null;
  const forwardedLocale = requestHeaders.get(LOCALE_HEADER_NAME) ?? undefined;
  const locale = isSupportedLocale(forwardedLocale) ? forwardedLocale : defaultLocale;

  // Shopify stores URL redirects for unprefixed paths, so look up the path without its locale.
  const url = new URL(storefrontUrl);
  url.pathname = splitLocalePath(url.pathname).pathname;
  const request = new Request(url, { headers: requestHeaders });
  const requestContext = createShopifyRequestContext({
    i18n: getCommerceLocale(locale),
    request,
  });
  const response = await handleShopifyRedirects({
    request,
    routeTemplates: SHOPIFY_ROUTE_TEMPLATES,
    storefrontClient: createRequestStorefrontClient(requestContext),
  });
  if (!response) return null;
  const target = response.headers.get("location");
  if (!target) return null;
  const location = target.startsWith("/") ? localizePath(target, locale) : target;

  if (response.status === 301 || response.status === 308) permanentRedirect(location);
  redirect(location);
}
