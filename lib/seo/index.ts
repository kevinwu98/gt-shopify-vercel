import type { SearchParamsInput } from "./types";

function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withLeadingSlash === "/") return withLeadingSlash;
  return withLeadingSlash.replace(/\/+$/, "");
}

function toSearchParams(input: SearchParamsInput): URLSearchParams {
  if (!input) return new URLSearchParams();
  if (input instanceof URLSearchParams) return new URLSearchParams(input);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      if (key.startsWith("filter.")) {
        if (value.length > 0) params.set(key, value.join(","));
      } else {
        for (const item of value) {
          params.append(key, item);
        }
      }
      continue;
    }
    params.set(key, value);
  }

  return params;
}

export function buildCanonicalPath(pathname: string, searchParams?: SearchParamsInput): string {
  const params = toSearchParams(searchParams);
  params.delete("cursor");

  const query = params.toString();
  const normalizedPath = normalizePath(pathname);
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}
