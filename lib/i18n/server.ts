import { getLocale } from "gt-next/server";
import { headers } from "next/headers";

import type { CommerceLocale } from "@/lib/config/types";
import {
  defaultLocale,
  getCommerceLocale,
  isSupportedLocale,
  LOCALE_HEADER_NAME,
} from "@/lib/i18n";

/** Shopify country and language for the page's `[locale]`; pass it to every catalog read. */
export async function getRequestCommerceLocale(): Promise<CommerceLocale> {
  return getCommerceLocale(await getLocale());
}

/** The same market for dynamic code without route params (server actions, the cart seed), from the proxy's header. */
export async function getForwardedCommerceLocale(): Promise<CommerceLocale> {
  const locale = (await headers()).get(LOCALE_HEADER_NAME) ?? undefined;
  return getCommerceLocale(isSupportedLocale(locale) ? locale : defaultLocale);
}
