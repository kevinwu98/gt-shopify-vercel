"use client";

import { T, useLocale, useLocales } from "gt-next";
import { useId } from "react";

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
          // Copy language only changes the URL prefix; cart and Shopify market stay as they are.
          const { pathname } = splitLocalePath(window.location.pathname);
          window.location.assign(
            `${localizePath(pathname, event.target.value)}${window.location.search}`,
          );
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
