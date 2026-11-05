import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RichTextPage, RichTextPageSkeleton } from "@/components/content/rich-text-page";
import { getCatalogText } from "@/lib/catalog/server";
import { getShopPolicies, getShopPolicy } from "@/lib/policies/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

export async function generateStaticParams() {
  try {
    const policies = await getShopPolicies();
    return policies.length > 0
      ? policies.map(({ handle }) => ({ handle }))
      : [{ handle: PLACEHOLDER_HANDLE }];
  } catch {
    return [{ handle: PLACEHOLDER_HANDLE }];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/policies/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) return {};
  const policy = await getShopPolicy({
    handle,
  });
  if (!policy) notFound();
  const pathname = `/policies/${policy.handle}`;
  const ct = await getCatalogText();
  const title = ct(policy.title);
  return {
    alternates: await buildAlternates({ pathname }),
    openGraph: await buildOpenGraph({ title, type: "website", url: pathname }),
    title,
  };
}

export default function PolicyPage({ params }: PageProps<"/[locale]/policies/[handle]">) {
  return (
    <Suspense fallback={<RichTextPageSkeleton />}>
      <PolicyPageContent params={params} />
    </Suspense>
  );
}

async function PolicyPageContent({
  params,
}: Pick<PageProps<"/[locale]/policies/[handle]">, "params">) {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) notFound();
  const policy = await getShopPolicy({
    handle,
  });
  if (!policy) notFound();
  // Policy bodies are legal text, so they stay in the merchant's language; only the title is translated.
  const ct = await getCatalogText();
  return <RichTextPage body={policy.body} title={ct(policy.title)} />;
}
