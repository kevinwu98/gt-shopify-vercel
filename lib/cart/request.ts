import {
  createCartServerHandlers,
  getCartId,
  gql,
  type ShopifyRequestContext,
} from "@shopify/hydrogen";

import type { getHydrogenCustomerSession } from "@/lib/auth/request";
import { CART_FRAGMENT } from "@/lib/shopify/fragments/cart";
import { shopifyLogger } from "@/lib/shopify/logging/server";
import { createRequestStorefrontClient } from "@/lib/shopify/storefront/server";

export const cartHandlers = createCartServerHandlers({ fragment: CART_FRAGMENT });

export function createCustomerCartHandlers(
  customerSession: Awaited<ReturnType<typeof getHydrogenCustomerSession>>,
) {
  return createCartServerHandlers({
    customerSession,
    fragment: CART_FRAGMENT,
  });
}

const CART_COUNTRY_UPDATE_MUTATION = gql(`#graphql
  mutation cartCountryUpdate($cartId: ID!, $countryCode: CountryCode!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: { countryCode: $countryCode }) {
      userErrors {
        message
      }
    }
  }
`);

/**
 * Moves the shopper's cart to the request's market so prices and checkout use its currency.
 * Hydrogen's cart handlers have no intent for the buyer country, so the proxy calls this when the language changes.
 */
export async function moveCartToMarket(
  request: Request,
  requestContext: ShopifyRequestContext,
): Promise<void> {
  const cartId = getCartId({ cookie: request.headers.get("cookie") ?? undefined });
  if (!cartId) return;
  const countryCode = requestContext.i18n.country;
  try {
    const { data, errors } = await createRequestStorefrontClient(requestContext).graphql(
      CART_COUNTRY_UPDATE_MUTATION,
      { variables: { cartId, countryCode } },
    );
    const message = errors?.[0]?.message ?? data?.cartBuyerIdentityUpdate?.userErrors[0]?.message;
    if (message)
      shopifyLogger.warn("Cart market move failed", { countryCode, error: message, scope: "cart" });
  } catch (error) {
    // The page still renders; the cart keeps its previous market until the next language switch.
    shopifyLogger.warn("Cart market move failed", { countryCode, error, scope: "cart" });
  }
}
