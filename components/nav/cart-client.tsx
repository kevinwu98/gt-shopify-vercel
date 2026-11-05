"use client";

import { useGT } from "gt-next";
import { HandbagIcon } from "lucide-react";

import { useCartDrawer } from "@/components/cart/context";
import { useCart } from "@/lib/cart/client";

interface CartIconClientProps {
  initialCart: { totalQuantity: number } | null;
}

export function CartIconClient({ initialCart }: CartIconClientProps) {
  const gt = useGT();
  const quantity = useCart((state) =>
    state.loading
      ? (initialCart?.totalQuantity ?? state.data.totalQuantity)
      : state.data.totalQuantity,
  );
  const { openOverlay } = useCartDrawer();

  return (
    <button
      onClick={openOverlay}
      className="flex cursor-pointer items-center justify-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors"
      type="button"
    >
      <span className="relative">
        <HandbagIcon className="size-5" />
        {quantity > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-2 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-xxs leading-none text-background"
          >
            {quantity}
          </span>
        )}
      </span>
      <span className="sr-only">
        {quantity > 0
          ? gt("Cart, {count, plural, one {# item} other {# items}}", { count: quantity })
          : gt("Cart")}
      </span>
    </button>
  );
}
