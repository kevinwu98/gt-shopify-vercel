import { getTranslations } from "gt-next/server";

import { CartNotifications } from "./notifications";
import { CartOverlay } from "./overlay";

export async function CartUI() {
  const t = await getTranslations("cart");
  return (
    <>
      <CartNotifications />
      <CartOverlay description={t("description")} title={t("title")} />
    </>
  );
}
