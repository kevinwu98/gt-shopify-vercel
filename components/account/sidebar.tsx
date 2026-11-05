import { getMessages } from "gt-next/server";

import { ACCOUNT_LINKS } from "./links";
import { SidebarClient } from "./sidebar-client";

export async function AccountSidebar() {
  const m = await getMessages();
  return <SidebarClient links={ACCOUNT_LINKS.map((link) => ({ ...link, label: m(link.label) }))} />;
}
