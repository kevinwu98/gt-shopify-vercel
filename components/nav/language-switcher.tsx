"use client";

import { T, useLocale, useLocales } from "gt-next";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef } from "react";

import { useCartActions } from "@/lib/cart/client";
import { localizePath, splitLocalePath } from "@/lib/i18n";

const SCROLL_KEY = "language-switch-scroll";

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
    // If Next.js loaded the page in full, return to where the shopper was reading.
    try {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) {
        sessionStorage.removeItem(SCROLL_KEY);
        const { path, y } = JSON.parse(saved) as { path: string; y: number };
        if (path === window.location.pathname) window.scrollTo(0, y);
      }
    } catch {
      // Storage can be unavailable; staying at the top is fine.
    }
  }, [locale, refresh]);

  return (
    <>
      <label htmlFor={id} className="sr-only">
        <T>Language</T>
      </label>
      <select
        id={id}
        className="cursor-pointer bg-transparent text-sm text-muted-foreground hover:text-foreground"
        value={locale}
        onChange={(event) => {
          const { pathname } = splitLocalePath(window.location.pathname);
          const nextPath = localizePath(pathname, event.target.value);
          try {
            sessionStorage.setItem(
              SCROLL_KEY,
              JSON.stringify({ path: nextPath, y: window.scrollY }),
            );
          } catch {
            // Storage can be unavailable; the page still switches language.
          }
          router.replace(`${nextPath}${window.location.search}`, { scroll: false });
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
