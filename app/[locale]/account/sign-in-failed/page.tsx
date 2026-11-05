import { T } from "gt-next";
import { getGT } from "gt-next/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const gt = await getGT();
  return {
    robots: { follow: false, index: false },
    title: gt("Sign-in failed"),
  };
}

export default function SignInFailedPage() {
  if (!shopConfig.auth.isEnabled) notFound();

  return (
    <Page className="flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <T>
            <h1 className="text-3xl sm:text-4xl md:text-5xl">Sign-in failed</h1>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              Your sign-in didn’t finish. Try again, or keep shopping without an account.
            </p>
          </T>
          <div className="flex flex-wrap justify-center gap-2.5">
            {/* oxlint-disable-next-line next/no-html-link-for-pages -- Sign-in must be a full document navigation so the proxy can start OAuth. */}
            <a
              href="/account/login"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <T>Try again</T>
            </a>
            <Link
              href="/"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border px-8 text-sm font-medium transition-colors hover:bg-muted"
            >
              <T>Continue shopping</T>
            </Link>
          </div>
        </div>
      </Container>
    </Page>
  );
}
