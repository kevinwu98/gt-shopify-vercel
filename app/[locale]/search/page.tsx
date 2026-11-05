import { Num, Plural, T, Var } from "gt-next";
import { getGT } from "gt-next/server";
import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchViewedTracker } from "@/components/analytics/trackers";
import { Browse } from "@/components/collections/browse";
import { BrowseFallback } from "@/components/collections/toolbar";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { SEARCH_SORT_EXCLUDE } from "@/lib/collections";
import { readBrowseState } from "@/lib/collections/server";
import type { BrowseResults, BrowseState } from "@/lib/collections/types";
import { getRequestCommerceLocale } from "@/lib/i18n/server";
import { fetchSearchResults } from "@/lib/search/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/[locale]/search">): Promise<Metadata> {
  const gt = await getGT();
  const resolvedSearchParams = await searchParams;
  const query = getParam(resolvedSearchParams, "q") ?? "";
  const hasQuery = query.length > 0;
  const title = hasQuery ? gt('Search results for "{query}"', { query }) : gt("Search");
  const description = hasQuery
    ? gt('Find products matching "{query}"', { query })
    : gt("Search for products in our store");
  return {
    title,
    description,
    alternates: await buildAlternates({
      pathname: "/search",
      searchParams: resolvedSearchParams,
    }),
    openGraph: await buildOpenGraph({
      title,
      description,
      url: "/search",
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SearchPage({ searchParams }: PageProps<"/[locale]/search">) {
  // Don't await searchParams here — it would force the route fully dynamic.
  const statePromise = readBrowseState(searchParams);
  const resultsPromise = Promise.all([searchParams, getRequestCommerceLocale()]).then(
    ([resolved, locale]) =>
      fetchSearchResults({ locale, query: getParam(resolved, "q"), statePromise }),
  );
  return (
    <Page className="pt-2.5 md:pt-10">
      <Container>
        <Sections className="gap-5">
          <Suspense fallback={null}>
            <SearchAnalyticsTracker searchParamsPromise={searchParams} />
          </Suspense>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl">
              <Link href="/search">
                <T>Search</T>
              </Link>
              <Suspense fallback={null}>
                <SearchQueryLabel searchParamsPromise={searchParams} />
              </Suspense>
            </h1>
          </div>
          <Suspense fallback={<BrowseFallback resultCount={<Skeleton className="h-4 w-20" />} />}>
            <SearchBrowse
              resultsPromise={resultsPromise}
              searchParamsPromise={searchParams}
              statePromise={statePromise}
            />
          </Suspense>
        </Sections>
      </Container>
    </Page>
  );
}

async function SearchBrowse({
  resultsPromise,
  searchParamsPromise,
  statePromise,
}: {
  resultsPromise: Promise<BrowseResults>;
  searchParamsPromise: PageProps<"/[locale]/search">["searchParams"];
  statePromise: Promise<BrowseState>;
}) {
  const query = getParam(await searchParamsPromise, "q") ?? "";

  // A new term rebuilds the browse store so stale filters never carry across searches.
  return (
    <Browse
      path="/search"
      resultCount={
        <Suspense fallback={<Skeleton className="h-4 w-20" />}>
          <SearchResultCount resultsPromise={resultsPromise} />
        </Suspense>
      }
      results={resultsPromise}
      sortExclude={SEARCH_SORT_EXCLUDE}
      state={statePromise}
      storeKey={`search:${query}`}
    />
  );
}

async function SearchAnalyticsTracker({
  searchParamsPromise,
}: {
  searchParamsPromise: PageProps<"/[locale]/search">["searchParams"];
}) {
  const query = getParam(await searchParamsPromise, "q");
  return <SearchViewedTracker searchTerm={query ?? ""} />;
}

async function SearchQueryLabel({
  searchParamsPromise,
}: {
  searchParamsPromise: PageProps<"/[locale]/search">["searchParams"];
}) {
  const resolvedSearchParams = await searchParamsPromise;
  const query = getParam(resolvedSearchParams, "q");
  if (!query) return null;
  return (
    <>
      {" "}
      <T context="Follows the heading “Search”">
        for &quot;<Var>{query}</Var>&quot;
      </T>
    </>
  );
}

async function SearchResultCount({ resultsPromise }: { resultsPromise: Promise<BrowseResults> }) {
  const { total } = await resultsPromise;
  if (!total) return null;
  return (
    <T>
      <Plural
        n={total}
        one={
          <>
            <Num>{total}</Num> Item
          </>
        }
        other={
          <>
            <Num>{total}</Num> Items
          </>
        }
      />
    </T>
  );
}
