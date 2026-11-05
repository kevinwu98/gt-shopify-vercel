"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";
import { splitLocalePath } from "@/lib/i18n";

interface AccountSidebarLink {
  href: string;
  label: string;
}

export function SidebarClient({ links }: { links: AccountSidebarLink[] }) {
  // Links are unprefixed; the URL carries the locale prefix outside the default locale.
  const { pathname } = splitLocalePath(usePathname());

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith(link.href)
              ? "bg-accent font-medium text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
