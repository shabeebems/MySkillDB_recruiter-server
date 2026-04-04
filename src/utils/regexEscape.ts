/** Escape a string for safe use as a literal inside MongoDB `$regex` (avoids ReDoS / unintended patterns). */
export function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MAX_SEARCH_LEN = 200;

/** Trim and cap length for user-supplied search strings. */
export function sanitizeSearchInput(value: string | undefined): string {
  if (value == null || typeof value !== "string") return "";
  return value.trim().slice(0, MAX_SEARCH_LEN);
}
