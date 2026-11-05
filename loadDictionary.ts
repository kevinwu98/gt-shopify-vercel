// English copy lives in dictionary.json; these are the translated dictionaries.
const dictionaries: Record<string, () => Promise<{ default: object }>> = {
  fr: () => import("./dictionaries/fr.json"),
  ja: () => import("./dictionaries/ja.json"),
};

export default async function loadDictionary(locale: string): Promise<object> {
  const dictionary = await dictionaries[locale]?.();
  return dictionary?.default ?? {};
}
