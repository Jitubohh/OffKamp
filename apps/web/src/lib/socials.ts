/**
 * Accepts whatever the lister types - "@jitu", "jitu",
 * "instagram.com/jitu", "https://www.instagram.com/jitu/?hl=en" - and
 * returns the bare handle, or null if nothing usable is left.
 */
export function normalizeHandle(raw: string): string | null {
  let s = raw.trim();
  if (s === "") return null;

  // strip a pasted URL down to the first path segment
  s = s.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  s = s.replace(/^(instagram|tiktok)\.com\//i, "");
  s = s.split(/[/?#]/)[0];

  // leading @ and any stray whitespace
  s = s.replace(/^@+/, "").trim();

  if (s === "") return null;
  if (!/^[A-Za-z0-9._]{1,30}$/.test(s)) return null;

  return s;
}

export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}

export function tiktokUrl(handle: string): string {
  return `https://tiktok.com/@${handle}`;
}