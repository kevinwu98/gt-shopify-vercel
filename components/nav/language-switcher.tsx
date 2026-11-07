"use client";

import { T, useLocale, useLocales } from "gt-next";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef } from "react";

import { useCartActions } from "@/lib/cart/client";
import { localizePath, splitLocalePath } from "@/lib/i18n";

/** Names each language in itself ("Français", "日本語") so shoppers recognize their own. */
function getEndonym(locale: string): string {
  const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

export function LanguageSwitcher() {
  const id = useId();
  const locale = useLocale();
  const locales = useLocales();
  const router = useRouter();
  const { refresh } = useCartActions();
  const previousLocale = useRef(locale);

  useEffect(() => {
    // The proxy moved the cart to the new language's Shopify market; reload it in that currency.
    if (previousLocale.current !== locale) refresh();
    previousLocale.current = locale;
  }, [locale, refresh]);

  return (
    <>
      <label htmlFor={id} className="sr-only">
        <T>Language</T>
      </label>
      <select
        id={id}
        // Chrome rings a focused <select> even after a mouse pick, and the ring vanishes when the
        // new locale's page replaces it; brighten the text for focus instead.
        className="cursor-pointer bg-transparent text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
        value={locale}
        onChange={(event) => {
          const { pathname } = splitLocalePath(window.location.pathname);
          // Client navigation keeps the scroll position; the proxy moves the cart to the new market.
          router.replace(`${localizePath(pathname, event.target.value)}${window.location.search}`, {
            scroll: false,
          });
        }}
      >
        {locales.map((option) => (
          <option key={option} lang={option} value={option}>
            {getEndonym(option)}
          </option>
        ))}
      </select>
    </>
  );
}
