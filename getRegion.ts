import { shopConfig } from "@/lib/config";

// Copy language never selects the commerce country; Shopify context stays on the configured market.
export default async function getRegion(): Promise<string> {
  return shopConfig.localization.country;
}
