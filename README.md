# Great Things — Vercel Shop + General Translation

A multilingual Shopify storefront: the [Vercel Shop](https://github.com/vercel/shop) Next.js template (`@shopify/hydrogen` 2026.10, Next.js 16 Cache Components) localized end to end with [General Translation](https://generaltranslation.com). It is the Next.js companion to the Hydrogen React Router storefront in [kevinwu98/gt-shopify](https://github.com/kevinwu98/gt-shopify) and sells from the same Shopify store. Upstream template changes merge in from `vercel/shop`.

## What's translated

- **Interface copy** with [`gt-next`](https://generaltranslation.com/docs/react/nextjs): copy stays inline in each component. JSX uses `<T>` with `<Var>`, `<Num>`, `<Currency>`, `<DateTime>` and `<Plural>`; attributes, metadata and props use `getGT()` on the server and `useGT()` on the client; module-level labels use `msg()`.
- **Shopify catalog copy**: product titles, descriptions, options, image alt text, collection titles, page titles and bodies, filter labels and policy titles. `pnpm catalog:export` writes the store's English text to `catalog/en.json`; `pnpm translate` translates it with the interface copy. `lib/catalog` looks translations up by their English text, so anything edited in Shopify after the last export shows its live English until the next export.
- **Prices and currency** come from Shopify Markets: each language sells in its market (English → US/USD, French → France/EUR, Japanese → Japan/JPY, Korean → Korea/KRW, Indonesian → Indonesia/IDR), so Shopify returns that market's prices and checkout currency, formatted for the language (`$40.00`, `36,95 €`, `￥6,500`, `₩56,000`, `Rp 1.652.000`).
- **SEO**: localized `<html lang>`, canonical URLs, `hreflang` alternates on every page and in the sitemap, and localized Open Graph and Schema.org data.

Policy bodies (legal text) and the Markdown/`llms.txt` agent surface stay in English. Checkout is hosted by Shopify and follows the store's published languages.

## How it works

- **Locales**: `en` (default, unprefixed), plus `fr`, `ja`, `ko` and `id` at `/fr`, `/ja`, `/ko` and `/id`, set in `gt.config.json`. Every storefront route lives under `app/[locale]/` and is prerendered per locale.
- **Routing**: `proxy.ts` rewrites unprefixed requests to the default locale after Hydrogen's Shopify route handlers run; `/en/...` is not a URL, so each page has one canonical address. This matches the routing proposed for Hydrogen's `defineShopifyI18n` ([Shopify/hydrogen#4009](https://github.com/Shopify/hydrogen/pull/4009)).
- **Cache Components**: `getLocale.ts` reads the `[locale]` root param and `loadTranslations.ts` imports the generated files in `public/_gt/`, so translated pages stay static. See [Using Cache Components](https://generaltranslation.com/docs/react/nextjs/cache-components).
- **Links**: `components/ui/link.tsx` localizes internal hrefs with `useLocalizeHref()`; the language switcher in the nav keeps the current page.
- **Markets**: `lib/i18n` maps each locale to a Shopify country and language. Pages pass it to every Storefront API read (`@inContext`), the proxy runs Hydrogen's cart and search handlers in it (remembering the page locale in a cookie for `/api/cart`), and switching language moves the existing cart to the new market with `cartBuyerIdentityUpdate`, since Hydrogen's cart handlers have no intent for the buyer country. The currency always comes from Shopify's response.

## Run it

```sh
cp .env.example .env.local   # Shopify store domain, Storefront token, shop ID
pnpm install                 # pnpm 12; installs Node 26 per devEngines
pnpm build && pnpm start
```

Translations are committed, so building needs no General Translation key. To refresh them after changing copy or the catalog, put `GT_PROJECT_ID` and `GT_API_KEY` in `.env.gt` and run:

```sh
pnpm catalog:export
pnpm translate
```

---

# Vercel Shop

Agent-ready commerce, powered by Shopify, Next, and Eve.

- **Shopify owns commerce.** Catalog, cart, checkout, customer accounts, predictive search, and policies come from Shopify through the framework-agnostic Hydrogen SDK (not the Hydrogen React Router framework).
- **Next.js owns the app.** Routing, Server Components, caching and invalidation, metadata, and the storefront's machine-readable surface for answer engines: Markdown representations, `/llms.txt`, structured data, and the sitemap.
- **Eve owns the agent.** Shop Agent's sessions, tools, and connections; its tools call Shopify directly.

See [vercel.shop](https://vercel.shop) for full documentation.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fshop&project-name=shop&repository-name=shop&demo-title=Vercel+Shop&demo-url=https%3A%2F%2Fshop-template.vercel.app&env=NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN%2CNEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN%2CNEXT_PUBLIC_SHOPIFY_SHOP_ID&envDescription=Required%20Shopify%20store%20domain%2C%20Storefront%20API%20token%2C%20and%20shop%20ID&envLink=https%3A%2F%2Fvercel.shop%2Fdocs%2Freference%2Fenv-vars)

Vercel prompts for the three required Shopify values before the first deployment.

## Getting Started

1. Create a new project with pnpm 12 and Node.js 26:

```sh
pnpm create next-app@latest my-store --example https://github.com/vercel/shop
```

The project includes the Shop skills for your agent in `.agents/skills/`.

2. In Shopify admin, create a storefront token in **Settings → Apps and sales channels → Headless**, enable the required Storefront API permissions, then add your Shopify credentials:

```sh
cp .env.example .env.local
```

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token
NEXT_PUBLIC_SHOPIFY_SHOP_ID=123456789
```

3. Start the development server:

```sh
pnpm dev
```

For local HTTPS, install [Portless](https://portless.sh) globally with `pnpm add -g portless`, then run `pnpm dev:portless`.

See [vercel.shop/docs/getting-started](https://vercel.shop/docs/getting-started) for the full setup guide and [Storefront API Permissions](https://vercel.shop/docs/reference/storefront-api-permissions) for the complete scope reference.

## Features

Shopify

- Product, collection, search, blog, page, and policy content from the Storefront API with typed GraphQL
- Optimistic cart with Hydrogen forms, shared cart state, and server handlers
- Customer accounts through the Customer Account API, opt-in
- Shopify analytics, consent, and WebMCP tool registration, opt-in

Next.js

- Next.js 16 App Router, React 19, React Compiler, Tailwind CSS 4, shadcn/ui
- Partial prerendering with tagged caches invalidated by Shopify webhooks
- Markdown representations, `/llms.txt`, Schema.org data, sitemap, and robots for answer engines
- Single-locale storefront by default; skills add next-intl and Shopify Markets

Eve

- Shop Agent for product discovery, store questions, and cart updates in a side drawer, opt-in
- Shopify catalog and policy MCP connections plus Hydrogen cart handlers

Customer authentication is disabled by default. Follow the [authentication guide](https://vercel.shop/docs/anatomy/authentication) to configure Shopify credentials and callback URLs before enabling `auth.isEnabled` in `lib/config/index.ts`.

Shop Agent is disabled by default. Set `agent.isEnabled` to `true` in `lib/config/index.ts` and follow the [Shop Agent guide](https://vercel.shop/docs/anatomy/agent) to configure AI Gateway access, turn on bot protection, and review privacy and spending safeguards before enabling public chat.

## Skills

Shop skills guide agents through storefront setup and common commerce patterns. They ship in `.agents/skills/`, and Claude Code reads them through the `.claude/skills` symlink. To add them to an existing storefront, run this from its root:

```sh
pnpm dlx skills add vercel/shop --skill '*' --yes
```

Use the plain skill names below. Shopify AI Toolkit is separate external tooling for authoritative Shopify documentation, API schemas, and operation validation; the Shop skills do not include it. If it is unavailable, use official Shopify documentation and validation tooling.

| Skill                       | Description                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| `init-vercel-shop`          | Scaffold a storefront and configure Shopify credentials               |
| `build-shop`                | Build or adapt storefront routes with Vercel Shop patterns            |
| `shopify-graphql-reference` | Add Shopify-validated GraphQL operations in the template's layout     |
| `enable-analytics`          | Add Vercel Analytics, Speed Insights, and Google Tag Manager          |
| `enable-i18n`               | Locale-prefixed URL routing + next-intl message catalogs (no Markets) |
| `enable-shopify-markets`    | Multi-locale support with Shopify Markets and next-intl               |
| `enable-shopify-menus`      | Replace hardcoded nav/footer links with Shopify-managed menus         |
| `update-shop`               | Keep a storefront current with template changes                       |

## Documentation

Full documentation is available at [vercel.shop](https://vercel.shop).

## License

MIT
