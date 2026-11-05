import { notFound } from "next/navigation";

import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

// gt-next's client provider reads usePathname(), so this route needs a known param to prerender its shell.
export function generateStaticParams() {
  return [{ rest: [PLACEHOLDER_HANDLE] }];
}

// Unmatched paths render app/[locale]/not-found.tsx inside the localized layout.
export default function CatchAllPage(): never {
  notFound();
}
