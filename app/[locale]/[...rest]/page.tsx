import { notFound } from "next/navigation";

import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

// gt-next 11.4's GTProvider reads usePathname(), so a route without static params fails to prerender
// (fix: generaltranslation/gt#2641). A placeholder param keeps its shell static until that ships.
export function generateStaticParams() {
  return [{ rest: [PLACEHOLDER_HANDLE] }];
}

// Unmatched paths render app/[locale]/not-found.tsx inside the localized layout.
export default function CatchAllPage(): never {
  notFound();
}
