import { CollectionLayout } from "@/components/collections/collection-page";
import { SEARCH_SORT_EXCLUDE } from "@/lib/collections";
import { ALL_PRODUCTS_HANDLE, getLocalizedAllProductsCollection } from "@/lib/collections/server";

export default async function AllProductsLayout({
  children,
}: LayoutProps<"/[locale]/collections/all">) {
  return (
    <CollectionLayout
      collection={await getLocalizedAllProductsCollection()}
      handle={ALL_PRODUCTS_HANDLE}
      sortExclude={SEARCH_SORT_EXCLUDE}
    >
      {children}
    </CollectionLayout>
  );
}
