import { T } from "gt-next";
import { getGT } from "gt-next/server";
import type { Metadata } from "next";

import { CollectionCard } from "@/components/collections/collection-card";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getCatalogText } from "@/lib/catalog/server";
import { getCollectionsListing } from "@/lib/collections/server";
import { getRequestCommerceLocale } from "@/lib/i18n/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  const title = gt("Collections");
  const description = gt("Browse products by collection.");
  return {
    title,
    description,
    alternates: await buildAlternates({
      pathname: "/collections",
    }),
    openGraph: await buildOpenGraph({
      title,
      description,
      url: "/collections",
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  };
}

export default async function CollectionsPage() {
  const gt = await getGT();
  const [collections, ct] = await Promise.all([
    getCollectionsListing({ locale: await getRequestCommerceLocale() }),
    getCatalogText(),
  ]);
  const viewCollectionLabel = gt("View this collection");
  return (
    <Page className="pt-2.5 md:pt-10">
      <Container>
        <Sections className="gap-5">
          <T>
            <h1 className="text-3xl sm:text-4xl md:text-5xl">Collections</h1>
          </T>

          {collections.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.handle}
                  collection={{
                    ...collection,
                    description: ct(collection.description),
                    title: ct(collection.title),
                  }}
                  viewCollectionLabel={viewCollectionLabel}
                />
              ))}
            </div>
          ) : (
            <T>
              <p className="text-muted-foreground">No collections found.</p>
            </T>
          )}
        </Sections>
      </Container>
    </Page>
  );
}
