import { T } from "gt-next";
import { getLocale } from "gt-next/server";

import { Button } from "@/components/ui/button";
import { localizePath } from "@/lib/i18n";

export async function SignOutButton() {
  const returnTo = localizePath("/", await getLocale());
  return (
    <form action={`/account/logout?return_to=${returnTo}`} method="post">
      <Button className="w-full" size="sm" type="submit" variant="outline">
        <T>Sign out</T>
      </Button>
    </form>
  );
}
