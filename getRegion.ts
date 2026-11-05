import { locale } from "next/root-params";

import { defaultLocale, getCommerceLocale } from "@/lib/i18n";

// Each language sells in one Shopify market, so the region is that market's country.
export default async function getRegion(): Promise<string> {
  return getCommerceLocale((await locale()) ?? defaultLocale).country;
}
