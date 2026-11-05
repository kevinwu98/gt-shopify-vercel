import { T } from "gt-next";
import { getGT } from "gt-next/server";
import type { Metadata } from "next";

import { ProductsGrid } from "@/components/product/products-grid";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  const title = gt("Home");
  const description = gt("Explore featured products, curated collections, and seasonal campaigns.");
  return {
    title: `${title} | ${shopConfig.site.name}`,
    description,
    alternates: await buildAlternates({ pathname: "/" }),
    openGraph: await buildOpenGraph({
      title,
      description,
      url: "/",
      type: "website",
    }),
  };
}

export default async function HomePage() {
  const gt = await getGT();
  return (
    <Page className="pt-0">
      <Sections>
        <section className="grid grid-cols-1">
          <div className="col-start-1 row-start-1 hidden md:block md:aspect-4/1" />
          <div className="relative col-start-1 row-start-1 flex items-center justify-center px-5 py-10 lg:px-10">
            <div className="flex flex-col items-center text-center gap-2.5">
              <h1 className="text-3xl md:text-5xl max-w-3xl text-foreground">
                <T>A storefront localized with General Translation</T>
              </h1>
              <p className="text-sm md:text-base max-w-xl text-foreground">
                <T>
                  Shopify commerce on Hydrogen and Next.js, with interface copy translated by
                  gt-next.
                </T>
              </p>
            </div>
          </div>
        </section>

        <Container>
          <ProductsGrid
            title={gt("Products")}
            eagerCount={4}
            limit={8}
            collectionUrl="/collections/all"
          />
        </Container>
      </Sections>
    </Page>
  );
}
