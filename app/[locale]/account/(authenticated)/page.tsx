import { getLocale } from "gt-next/server";
import { redirect } from "next/navigation";

import { localizePath } from "@/lib/i18n";

export default async function AccountPage() {
  redirect(localizePath("/account/profile", await getLocale()));
}
