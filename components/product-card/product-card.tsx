"use client";

import { useCatalogText } from "@/components/catalog/catalog-provider";
import { Link } from "@/components/ui/link";
import { buildProductUrl } from "@/lib/product";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardImageContainer,
  ProductCardPrice,
  ProductCard as ProductCardRoot,
  ProductCardSkeleton,
  ProductCardTitle,
} from "./components";
import { QuickShop } from "./quick-shop";

export interface ProductCardProps {
  loading?: "eager" | "lazy";
  outOfStockText?: string;
  product: ProductCardType;
  quickShopText?: string;
}

export function ProductCard({ loading, outOfStockText, product, quickShopText }: ProductCardProps) {
  const ct = useCatalogText();
  const href = buildProductUrl(product.handle, product.defaultVariantSelectedOptions ?? []);
  const title = ct(product.title);
  // The link is stretched rather than wrapping the card so Quick Shop isn't a button inside an anchor.
  return (
    <ProductCardRoot>
      <ProductCardImageContainer>
        <ProductCardImage
          src={product.featuredImage?.url}
          alt={ct(product.featuredImage?.altText) || title}
          height={product.featuredImage?.height}
          loading={loading}
          outOfStock={!product.availableForSale}
          outOfStockText={outOfStockText}
          width={product.featuredImage?.width}
        >
          {quickShopText && product.availableForSale && !product.isGiftCard ? (
            <QuickShop
              handle={product.handle}
              href={href}
              image={product.featuredImage?.url ?? null}
              label={quickShopText}
              title={product.title}
            />
          ) : null}
        </ProductCardImage>
        <ProductCardContent>
          <ProductCardTitle>
            <Link href={href} className="after:absolute after:inset-0">
              {title}
            </Link>
          </ProductCardTitle>
          <ProductCardPrice
            amount={product.price.amount}
            currencyCode={product.price.currencyCode}
            maxAmount={product.maxPrice.amount}
            compareAtAmount={product.compareAtPrice?.amount}
            compareAtCurrencyCode={product.compareAtPrice?.currencyCode}
          />
        </ProductCardContent>
      </ProductCardImageContainer>
    </ProductCardRoot>
  );
}

export { ProductCardSkeleton };
