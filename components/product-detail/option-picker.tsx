"use client";

import { cn } from "cn";
import { T, useGT, Var } from "gt-next";
import type { ComponentProps } from "react";

import { useCatalogText } from "@/components/catalog/catalog-provider";
import { Link } from "@/components/ui/link";
import type { OptionGroupState } from "@/lib/product/types";

interface OptionPickerProps extends ComponentProps<"div"> {
  compact?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
}

// Option names and values stay English for selection and URLs; only the displayed labels are translated.
export function OptionLabel({ name, value }: { name: string; value: string }) {
  const ct = useCatalogText();
  return (
    <p className="text-sm font-medium text-foreground/70">
      <T>
        <Var>{ct(name)}</Var>:{" "}
        <span className="text-foreground">
          <Var>{ct(value)}</Var>
        </span>
      </T>
    </p>
  );
}

export function OptionPicker({
  compact = false,
  onSelectValue,
  option,
  className,
  ...props
}: OptionPickerProps) {
  const gt = useGT();
  const ct = useCatalogText();
  const optionName = ct(option.name);
  return (
    <div className={cn("grid gap-2.5", className)} {...props}>
      <p className="text-sm font-medium text-foreground/70">{optionName}</p>
      <div className="flex flex-wrap gap-2">
        {option.values.map((value) => {
          const classes = cn(
            "grid px-5 text-center text-sm rounded-lg transition-all border",
            compact ? "py-1" : "py-2",
            !value.exists
              ? "font-normal border-dashed border-border text-muted-foreground/50 line-through cursor-not-allowed"
              : value.selected
                ? "font-medium border-foreground text-foreground starting:border-border starting:text-muted-foreground"
                : "font-normal border-border text-muted-foreground hover:border-foreground hover:text-foreground",
            value.exists && !value.available && "border-dashed line-through",
          );

          // Invisible medium-weight twin reserves the bold width so pills don't shift on selection.
          const valueName = ct(value.name);
          const label = (
            <>
              <span className="col-start-1 row-start-1">{valueName}</span>
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-medium">
                {valueName}
              </span>
            </>
          );

          if (!value.exists) {
            return (
              <button
                key={value.name}
                aria-label={gt("{option}: {value} (unavailable)", {
                  option: optionName,
                  value: valueName,
                })}
                className={classes}
                disabled
                type="button"
              >
                {label}
              </button>
            );
          }

          return (
            <Link
              key={value.name}
              href={value.href}
              scroll={false}
              className={classes}
              aria-current={value.selected ? "true" : undefined}
              aria-label={
                value.available
                  ? undefined
                  : gt("{option}: {value} (sold out)", { option: optionName, value: valueName })
              }
              onClick={
                onSelectValue && !value.crossProduct
                  ? (event) => {
                      event.preventDefault();
                      onSelectValue(option.name, value.name);
                    }
                  : undefined
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
