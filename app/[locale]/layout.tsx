import { BotIdClient } from "botid/client";
import { GTProvider, T } from "gt-next";
import { getGT, getLocale } from "gt-next/server";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../globals.css";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActionBar } from "@/components/action-bar";
import { AgentButton } from "@/components/agent/agent-button";
import { AnalyticsComponents } from "@/components/analytics";
import { CartUI } from "@/components/cart/cart-ui";
import { CartProviderWrapper } from "@/components/cart/context";
import { CartStandardActionsScript } from "@/components/cart/standard-actions";
import { CatalogProvider } from "@/components/catalog/catalog-provider";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { SiteSchema } from "@/components/schema/site-schema";
import { botIdProtectedRoutes } from "@/lib/botid";
import { seedCartData } from "@/lib/cart/server";
import { getCatalogLabels } from "@/lib/catalog/server";
import { shopConfig } from "@/lib/config";
import { isSupportedLocale, locales } from "@/lib/i18n";

export const ensureStatic = "prefetch";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  if (!isSupportedLocale(locale)) notFound();
  // Un-awaited: the promise streams to the client provider; never block the shell on it.
  const cartData = seedCartData();
  return (
    <html lang={locale}>
      <head>
        {shopConfig.botid.isEnabled && <BotIdClient protect={botIdProtectedRoutes} />}
        <CartStandardActionsScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col font-sans antialiased`}
      >
        <GTProvider>
          <CatalogProvider labels={getCatalogLabels(locale)}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-5 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-foreground focus:outline-none"
            >
              <T>Skip to content</T>
            </a>
            <SiteSchema />

            <CartProviderWrapper cartData={cartData}>
              <Nav />
              <main id="main-content" className="flex flex-1 flex-col min-w-0">
                {children}
              </main>
              <Footer />
              <CartUI />
              <Suspense>
                <ActionBar>{shopConfig.agent.isEnabled && <AgentButton />}</ActionBar>
              </Suspense>
              <Suspense>
                <AnalyticsComponents />
              </Suspense>
            </CartProviderWrapper>
          </CatalogProvider>
        </GTProvider>
      </body>
    </html>
  );
}

export const generateMetadata = async (): Promise<Metadata> => {
  const gt = await getGT();
  return {
    description: gt("Shop premium products, curated collections, and latest offers from {name}.", {
      name: shopConfig.site.name,
    }),
    generator: shopConfig.site.name,
    metadataBase: new URL(shopConfig.site.url),
    openGraph: {
      images: [{ url: "/og-default.png", width: 1200, height: 628 }],
    },
    title: {
      default: shopConfig.site.name,
      template: `%s | ${shopConfig.site.name}`,
    },
  };
};
