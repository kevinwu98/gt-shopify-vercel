import { getMessages } from "gt-next/server";

import { ACCOUNT_LINKS } from "./links";
import { MobileTabsClient } from "./mobile-tabs-client";

export async function AccountMobileTabs() {
  const m = await getMessages();
  return <MobileTabsClient tabs={ACCOUNT_LINKS.map((tab) => ({ ...tab, label: m(tab.label) }))} />;
}
