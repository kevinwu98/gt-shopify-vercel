import { locale } from "next/root-params";

import { defaultLocale } from "@/lib/i18n";

// The `[locale]` root param is part of the static cache key, so reading it keeps pages prerenderable.
export default async function getLocale(): Promise<string> {
  return (await locale()) ?? defaultLocale;
}
