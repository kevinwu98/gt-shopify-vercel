"use client";

import { T } from "gt-next";
import { AlertCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

export function ErrorBoundaryContent({ retry }: { retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center lg:py-10">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-muted p-5">
          <AlertCircleIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>
      <h1 className="mb-2 text-2xl lg:text-3xl">
        <T>Something went wrong</T>
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        <T>An unexpected error occurred. Please try again.</T>
      </p>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button onClick={() => retry()}>
          <T>Try again</T>
        </Button>
        <Button variant="outline" render={<Link href="/" />}>
          <T>Go back to the home page</T>
        </Button>
      </div>
    </div>
  );
}
