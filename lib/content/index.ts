export function summarizeText(text: string, maxLength = 200): string {
  const summary = text.replace(/\s+/g, " ").trim();
  return summary.length > maxLength ? `${summary.slice(0, maxLength - 1).trimEnd()}…` : summary;
}
