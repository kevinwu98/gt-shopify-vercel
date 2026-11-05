"use client";

import { cn } from "cn";
import { useGT } from "gt-next";
import type { ComponentProps } from "react";

import { useCatalogText } from "@/components/catalog/catalog-provider";
import { Link } from "@/components/ui/link";
import { Swatch } from "@/components/ui/swatch";
import type { OptionGroupState } from "@/lib/product/types";

import { OptionLabel } from "./option-picker";

interface ColorPickerProps extends ComponentProps<"div"> {
  hideImages?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
}

export function ColorPicker({
  hideImages,
  onSelectValue,
  option,
  className,
  ...props
}: ColorPickerProps) {
  const gt = useGT();
  const ct = useCatalogText();
  const optionName = ct(option.name);
  const selectedValue = option.values.find((value) => value.selected)?.name ?? "";
  return (
    <div className={cn("grid gap-2.5", className)} {...props}>
      <OptionLabel name={option.name} value={selectedValue} />
      <div className="flex flex-wrap gap-2.5">
        {option.values.map((value) => {
          const valueName = ct(value.name);
          const imageUrl = hideImages
            ? undefined
            : value.swatch?.image || (value.swatch?.color ? undefined : value.image);
          const swatch = (
            <Swatch
              color={value.swatch?.color}
              image={imageUrl}
              label={valueName}
              selected={value.selected}
            />
          );
          if (!value.exists) {
            return (
              <button
                key={value.name}
                aria-label={gt("{option}: {value} (unavailable)", {
                  option: optionName,
                  value: valueName,
                })}
                className="block cursor-not-allowed opacity-40"
                disabled
                type="button"
              >
                {swatch}
              </button>
            );
          }
          return (
            <Link
              key={value.name}
              href={value.href}
              scroll={false}
              className={cn("block cursor-pointer", !value.available && "opacity-40")}
              aria-label={
                value.available
                  ? gt("Select {option}: {value}", { option: optionName, value: valueName })
                  : gt("Select {option}: {value} (sold out)", {
                      option: optionName,
                      value: valueName,
                    })
              }
              aria-current={value.selected ? "true" : undefined}
              onClick={
                onSelectValue && !value.crossProduct
                  ? (event) => {
                      event.preventDefault();
                      onSelectValue(option.name, value.name);
                    }
                  : undefined
              }
            >
              {swatch}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
