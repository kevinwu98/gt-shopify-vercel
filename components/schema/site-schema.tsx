import { useLocale } from "gt-next";

import { shopConfig } from "@/lib/config";
import { localizePath } from "@/lib/i18n";

function buildSiteSchema(locale: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: shopConfig.site.name,
      url: shopConfig.site.url,
      logo: `${shopConfig.site.url}/icons/icon-512.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: shopConfig.site.name,
      url: `${shopConfig.site.url}${localizePath("/", locale)}`,
      inLanguage: locale,
      potentialAction: {
        "@type": "SearchAction",
        target: `${shopConfig.site.url}${localizePath("/search", locale)}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function SiteSchema() {
  const schemas = buildSiteSchema(useLocale());
  return (
    <>
      {schemas.map((schema) => (
        <script key={schema["@type"]} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </>
  );
}
