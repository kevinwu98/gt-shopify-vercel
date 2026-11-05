"use client";

import { getSortByValue } from "@shopify/hydrogen";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";
import { msg, T, useMessages } from "gt-next";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SORT_VALUES } from "@/lib/collections";
import type { SortValue } from "@/lib/collections/types";

const SORT_LABELS: Record<SortValue, string> = {
  "best-selling": msg("Best Selling"),
  "created-ascending": msg("Date: Old to New"),
  "created-descending": msg("Date: New to Old"),
  manual: msg("Best Matches"),
  "price-ascending": msg("Price: Low to High"),
  "price-descending": msg("Price: High to Low"),
  "title-ascending": msg("Name: A-Z"),
  "title-descending": msg("Name: Z-A"),
};

export function CollectionsSortSelect({ exclude = [] }: { exclude?: SortValue[] } = {}) {
  const { reverse, sortKey, status } = useCollection();
  const { setSortByValue } = useCollectionActions();
  const m = useMessages();
  const options = SORT_VALUES.filter((value) => !exclude.includes(value));
  return (
    <Select
      value={sortKey ? getSortByValue(sortKey, reverse) : "manual"}
      onValueChange={(value) => setSortByValue(value ?? "manual")}
      disabled={status === "loading"}
    >
      <SelectTrigger className="border-0 shadow-none bg-transparent px-0">
        <T>
          <span>Sort</span>
        </T>
      </SelectTrigger>
      <SelectContent>
        {options.map((value) => (
          <SelectItem key={value} value={value}>
            {m(SORT_LABELS[value])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
