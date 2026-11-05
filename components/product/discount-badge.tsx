import { cn } from "cn";
import { Num, T } from "gt-next";
import type { ComponentProps } from "react";

interface DiscountBadgeProps extends ComponentProps<"span"> {
  percent: number;
}

export function DiscountBadge({ percent, className, ...props }: DiscountBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums bg-positive/15 text-positive",
        className,
      )}
      {...props}
    >
      <T>
        <Num options={{ style: "percent" }}>{percent / 100}</Num> OFF
      </T>
    </span>
  );
}
