import { DateTime } from "gt-next";
import Image from "next/image";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import type { BlogArticle } from "@/lib/blog/types";

export interface ArticleCardProps {
  article: BlogArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const href = `/blogs/${article.blogHandle}/${article.handle}`;
  return (
    <article className="grid content-start gap-4">
      <Link className="relative aspect-3/2 overflow-hidden rounded-xl" href={href}>
        {article.image ? (
          <Image
            alt={article.image.altText}
            className="object-cover transition-transform duration-300 hover:scale-105"
            fill
            sizes="100vw"
            src={article.image.url}
          />
        ) : (
          <ImagePlaceholder className="size-full bg-muted" />
        )}
      </Link>
      <div className="grid gap-2.5">
        <time className="text-muted-foreground text-sm" dateTime={article.publishedAt}>
          <DateTime options={{ dateStyle: "long" }}>{new Date(article.publishedAt)}</DateTime>
        </time>
        <h2 className="font-medium text-xl tracking-tight">
          <Link className="hover:underline" href={href}>
            {article.title}
          </Link>
        </h2>
        {article.excerpt && (
          <p className="text-muted-foreground text-sm leading-6 line-clamp-3">{article.excerpt}</p>
        )}
      </div>
    </article>
  );
}
