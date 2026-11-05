import { cn } from "cn";
import { useLocale } from "gt-next";
import type { ComponentProps } from "react";

import { formatPrice } from "@/lib/money";

interface PriceProps extends ComponentProps<"span"> {
  amount: string;
  currencyCode: string;
}

export function Price({ amount, currencyCode, className, ...props }: PriceProps) {
  const locale = useLocale();
  return (
    <span
      className={cn("font-mono text-xl text-foreground tabular-nums tracking-tight", className)}
      {...props}
    >
      {formatPrice({ amount, currencyCode }, locale)}
    </span>
  );
}
