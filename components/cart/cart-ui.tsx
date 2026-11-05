import { getGT } from "gt-next/server";

import { CartNotifications } from "./notifications";
import { CartOverlay } from "./overlay";

export async function CartUI() {
  const gt = await getGT();
  return (
    <>
      <CartNotifications />
      <CartOverlay
        description={gt("Review your cart items and proceed to checkout")}
        title={gt("Cart")}
      />
    </>
  );
}
