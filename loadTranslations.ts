// `pnpm translate` writes these files before the build; bundling them keeps pages prerenderable.
const translations: Record<string, () => Promise<{ default: object }>> = {
  fr: () => import("./public/_gt/fr.json"),
  ja: () => import("./public/_gt/ja.json"),
  ko: () => import("./public/_gt/ko.json"),
  id: () => import("./public/_gt/id.json"),
};

export default async function loadTranslations(locale: string): Promise<object> {
  const loaded = await translations[locale]?.();
  return loaded?.default ?? {};
}
