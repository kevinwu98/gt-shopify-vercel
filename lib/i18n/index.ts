import gtConfig from "@/gt.config.json";

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
