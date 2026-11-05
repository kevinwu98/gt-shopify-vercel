"use client";

import { useLocale, useLocales, useTranslations } from "gt-next";

import { localizePath, splitLocalePath } from "@/lib/i18n";

export function LanguageSwitcher() {
  const locale = useLocale();
  const locales = useLocales();
  const t = useTranslations("nav");
  return (
    <select
      aria-label={t("language")}
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
        <option key={option} value={option}>
          {new Intl.DisplayNames([option], { type: "language" }).of(option)}
        </option>
      ))}
    </select>
  );
}
