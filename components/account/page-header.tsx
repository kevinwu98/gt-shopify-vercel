import type { ReactNode } from "react";

export function AccountPageHeader({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl">{title}</h1>
      {description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}
    </div>
  );
}
