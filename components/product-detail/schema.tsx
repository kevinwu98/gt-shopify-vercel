import { useLocale } from "gt-next";

import { shopConfig } from "@/lib/config";
import { localizePath } from "@/lib/i18n";
import type { Image } from "@/lib/media/types";
import type { Money } from "@/lib/money/types";

interface ProductSchemaData {
  availableForSale: boolean;
  currencyCode: string;
  description: string;
  handle: string;
  images: Image[];
  offerCount: number;
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  sku?: string;
  title: string;
  vendor?: string;
}

interface ProductSchemaProps {
  product: ProductSchemaData;
}

// Name and description arrive in the page's locale; prices, currency, and SKU stay Shopify's.
export function ProductSchema({ product }: ProductSchemaProps) {
  const locale = useLocale();
  const url = `${shopConfig.site.url}${localizePath(`/products/${product.handle}`, locale)}`;
  const availability = product.availableForSale
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
  const { maxVariantPrice, minVariantPrice } = product.priceRange;
  // Google merchant listings require an Offer; an AggregateOffer only qualifies for product snippets.
  const singlePrice =
    minVariantPrice.amount === maxVariantPrice.amount &&
    minVariantPrice.currencyCode === maxVariantPrice.currencyCode;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: product.vendor
      ? {
          "@type": "Brand",
          name: product.vendor,
        }
      : undefined,
    offers: singlePrice
      ? {
          "@type": "Offer",
          availability,
          price: minVariantPrice.amount,
          priceCurrency: product.currencyCode,
          url,
        }
      : {
          "@type": "AggregateOffer",
          availability,
          highPrice: maxVariantPrice.amount,
          lowPrice: minVariantPrice.amount,
          offerCount: product.offerCount,
          priceCurrency: product.currencyCode,
          url,
        },
    sku: product.offerCount === 1 ? product.sku : undefined,
  };

  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}
