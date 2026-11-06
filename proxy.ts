import { handleShopifyRoutes } from "@shopify/hydrogen";
import {
  createCustomerAccountServerHandlers,
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
} from "@shopify/hydrogen/customer-account";
import { NextResponse, type NextRequest } from "next/server";

import {
  createCustomerRequestContext,
  createCustomerSessionManager,
  forwardCustomerRefreshAttempt,
  getCustomerRequestOrigin,
  getHydrogenCustomerSession,
} from "@/lib/auth/request";
import { cartHandlers, createCustomerCartHandlers, moveCartToMarket } from "@/lib/cart/request";
import { getRefinedCollectionPath, isRefinedCollectionPath } from "@/lib/collections";
import { shopConfig } from "@/lib/config";
import {
  defaultLocale,
  getCommerceLocale,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  splitLocalePath,
} from "@/lib/i18n";
import { getMarkdownRewritePath } from "@/lib/markdown/representation";
import { predictiveSearchHandlers } from "@/lib/search/request";
import { SHOPIFY_ROUTE_TEMPLATES } from "@/lib/shopify/routing";
import { createRequestStorefrontClient } from "@/lib/shopify/storefront/server";

const AUTH_PATHS = new Set<string>([
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
]);

export async function proxy(request: NextRequest): Promise<Response> {
  const pathname = request.nextUrl.pathname;
  const requestLocale = resolveRequestLocale(request);
  // Hydrogen's cart and search handlers run in the market of the shopper's language.
  const requestContext = createCustomerRequestContext(
    request,
    getCommerceLocale(requestLocale),
    requestLocale,
  );
  const isAuthPath = shopConfig.auth.isEnabled && AUTH_PATHS.has(pathname);
  const customerSession =
    isAuthPath || (shopConfig.auth.isEnabled && pathname === "/api/cart")
      ? await getHydrogenCustomerSession()
      : undefined;

  const routeOptions = {
    request,
    requestContext,
    routeTemplates: SHOPIFY_ROUTE_TEMPLATES,
    storefrontClient: createRequestStorefrontClient(requestContext),
  };
  const shopifyRoute = customerSession
    ? handleShopifyRoutes({
        ...routeOptions,
        handlers: customerHandlers(customerSession, isAuthPath),
        sessionManager: createCustomerSessionManager(request),
      })
    : handleShopifyRoutes({ ...routeOptions, handlers: [cartHandlers, predictiveSearchHandlers] });
  if (shopifyRoute) return shopifyRoute;

  const { locale, pathname: unprefixedPathname } = splitLocalePath(pathname);
  const rememberedLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (isPagePath(pathname) && rememberedLocale && rememberedLocale !== locale) {
    // A language switch changes the market; move the cart before the page reads it.
    await moveCartToMarket(request, requestContext);
  }
  if (isRefinedCollectionPath(unprefixedPathname))
    return new Response("Not Found", { status: 404 });

  const headers = requestContext.getForwardedRequestHeaders();
  headers.set(LOCALE_HEADER_NAME, requestLocale);
  const refinedPath = getRefinedCollectionPath(unprefixedPathname, request.nextUrl.search);
  const localizedPath = isUnlocalizedPath(pathname)
    ? null
    : `/${locale}${refinedPath ?? (unprefixedPathname === "/" ? "" : unprefixedPathname)}`;
  // Pages live under app/[locale]; the default locale is served unprefixed and rewritten internally.
  const rewritePath =
    getMarkdownRewritePath(request) ?? (localizedPath === pathname ? null : localizedPath);
  const response = rewritePath
    ? NextResponse.rewrite(new URL(`${rewritePath}${request.nextUrl.search}`, request.url), {
        request: { headers },
      })
    : NextResponse.next({
        request: { headers: forwardCustomerRefreshAttempt(request.nextUrl, headers) },
      });
  requestContext.applyResponseHeaders(response.headers);
  if (isPagePath(pathname) && rememberedLocale !== locale) {
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: "/", sameSite: "lax" });
  }
  return response;
}

/** The URL's locale for pages; the remembered page locale for unprefixed Shopify endpoints such as `/api/cart`. */
function resolveRequestLocale(request: NextRequest): string {
  const { pathname } = request.nextUrl;
  const { locale } = splitLocalePath(pathname);
  if (locale !== defaultLocale || isPagePath(pathname)) return locale;
  const remembered = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  return isSupportedLocale(remembered) ? remembered : defaultLocale;
}

// Storefront pages, as opposed to API routes and Shopify's dotted endpoints such as `/cart.js`.
function isPagePath(pathname: string): boolean {
  return !isUnlocalizedPath(pathname) && !/\.[a-z]+$/i.test(pathname);
}

const UNLOCALIZED_PATH = /^\/(?:api|md|agent|eve|_eve_internal|\.well-known|__shopify)(?:\/|$)/;

function isUnlocalizedPath(pathname: string): boolean {
  return UNLOCALIZED_PATH.test(pathname);
}

function customerHandlers(
  customerSession: Awaited<ReturnType<typeof getHydrogenCustomerSession>>,
  isAuthPath: boolean,
) {
  const cart = createCustomerCartHandlers(customerSession);
  if (!isAuthPath) return [cart, predictiveSearchHandlers];

  const auth = createCustomerAccountServerHandlers({
    cartServerHandlers: cart,
    customerSession,
    defaultPostLoginRedirectPathname: "/account",
    loginFailedRedirectPath: "/account/sign-in-failed",
    origin: getCustomerRequestOrigin,
    postLogoutRedirectUri: "/",
  });
  return [auth, cart, predictiveSearchHandlers];
}

export const config = {
  matcher: [
    // Only named static and metadata files skip the proxy: Shopify's dotted routes and `.md` mirrors must still match.
    "/((?!_next/static|_next/image|_next/data|_vercel|eve(?:/|$)|_eve_internal(?:/|$)|agent/ucp-profile\\.json$|apple-icon\\.png$|favicon\\.ico$|icon\\.svg$|icons/|llms\\.txt$|manifest\\.webmanifest$|og-default\\.png$|robots\\.txt$|sitemap\\.xml$|sitemap/).*)",
  ],
};
