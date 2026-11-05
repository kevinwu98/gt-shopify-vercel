import { cn } from "cn";
import { T } from "gt-next";
import { getGT } from "gt-next/server";
import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import { Link } from "@/components/ui/link";
import { getRequestCommerceLocale } from "@/lib/i18n/server";
import { getSearchIndexProducts } from "@/lib/product/server";

interface ProductsGridSkeletonProps {
  count: number;
  className?: string;
}

export function ProductsGridSkeleton({ count, className }: ProductsGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-5 lg:grid-cols-4", className)}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

interface ProductsGridProps {
  collectionUrl?: string;
  eagerCount?: number;
  limit: number;
  title: string;
}

export async function ProductsGrid({
  collectionUrl,
  eagerCount = 0,
  limit,
  title,
}: ProductsGridProps) {
  const gt = await getGT();
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        {collectionUrl && (
          <Link
            href={collectionUrl}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <T>View All</T>
          </Link>
        )}
      </div>
      <Suspense fallback={<ProductsGridSkeleton count={limit} />}>
        <ProductsGridContent
          eagerCount={eagerCount}
          limit={limit}
          outOfStockText={gt("Out of Stock")}
          quickShopText={gt("Choose")}
        />
      </Suspense>
    </div>
  );
}

async function ProductsGridContent({
  eagerCount,
  limit,
  outOfStockText,
  quickShopText,
}: {
  eagerCount: number;
  limit: number;
  outOfStockText: string;
  quickShopText: string;
}) {
  // Use the search index (not the products connection) so these match the first items on /collections/all.
  const { products } = await getSearchIndexProducts({
    limit,
    locale: await getRequestCommerceLocale(),
  });
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          loading={index < eagerCount ? "eager" : "lazy"}
          product={product}
          outOfStockText={outOfStockText}
          quickShopText={quickShopText}
        />
      ))}
    </div>
  );
}
