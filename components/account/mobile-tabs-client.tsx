"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";
import { splitLocalePath } from "@/lib/i18n";

interface AccountTab {
  href: string;
  label: string;
}

export function MobileTabsClient({ tabs }: { tabs: AccountTab[] }) {
  // Links are unprefixed; the URL carries the locale prefix outside the default locale.
  const { pathname } = splitLocalePath(usePathname());

  return (
    <div className="flex gap-1 border-b md:hidden">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex-1 px-3 py-2.5 text-center text-sm transition-colors",
            pathname.startsWith(tab.href)
              ? "border-b-2 border-foreground font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
