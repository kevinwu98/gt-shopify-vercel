import gtConfig from "@/gt.config.json";
import type { CommerceLocale } from "@/lib/config/types";

export const defaultLocale = gtConfig.defaultLocale;
export const locales = [gtConfig.defaultLocale, ...gtConfig.locales];

export function isSupportedLocale(value: string | undefined): value is string {
  return value !== undefined && locales.includes(value);
}

/** Splits `/fr/products/x` into `fr` and `/products/x`; unprefixed paths belong to the default locale. */
export function splitLocalePath(pathname: string): { locale: string; pathname: string } {
  const [, segment, ...rest] = pathname.split("/");
  if (segment !== defaultLocale && isSupportedLocale(segment)) {
    return { locale: segment, pathname: `/${rest.join("/")}` };
  }
  return { locale: defaultLocale, pathname };
}

/** The default locale stays unprefixed so every page keeps one canonical URL. */
export function localizePath(pathname: string, locale: string): string {
  if (locale === defaultLocale) return pathname;
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

// Each language sells in one Shopify market, so Shopify returns that market's prices and currency.
// Currency itself always comes from Shopify's response, never from this table.
const markets: Record<string, CommerceLocale> = {
  en: { country: "US", language: "EN" },
  fr: { country: "FR", language: "FR" },
  ja: { country: "JP", language: "JA" },
  ko: { country: "KR", language: "KO" },
  id: { country: "ID", language: "ID" },
};

export function getCommerceLocale(locale: string): CommerceLocale {
  const market = markets[locale];
  if (!market) throw new Error(`No Shopify market for locale: ${locale}`);
  return market;
}

/** The proxy remembers the page locale in this cookie, so Hydrogen handler calls (`/api/cart`) use the same market. */
export const LOCALE_COOKIE_NAME = "shop_locale";
/** The proxy forwards the resolved locale to server actions and the cart seed in this request header. */
export const LOCALE_HEADER_NAME = "x-shop-locale";
