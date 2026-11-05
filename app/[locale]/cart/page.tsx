import { getGT } from "gt-next/server";
import type { Metadata } from "next";
import { Suspense } from "react";

import { CartViewedTracker } from "@/components/analytics/trackers";
import { CartPageContent, CartPageSkeleton } from "@/components/cart/cart-page";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return {
    title: gt("Cart"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CartPage() {
  return (
    <>
      <CartViewedTracker />
      <Suspense fallback={<CartPageSkeleton />}>
        <CartPageContent />
      </Suspense>
    </>
  );
}
