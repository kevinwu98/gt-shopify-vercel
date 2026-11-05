import {
  createCartServerHandlers,
  getCartId,
  gql,
  type ShopifyRequestContext,
} from "@shopify/hydrogen";

import type { getHydrogenCustomerSession } from "@/lib/auth/request";
import { CART_FRAGMENT } from "@/lib/shopify/fragments/cart";
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
  await createRequestStorefrontClient(requestContext).graphql(CART_COUNTRY_UPDATE_MUTATION, {
    variables: { cartId, countryCode: requestContext.i18n.country },
  });
}
