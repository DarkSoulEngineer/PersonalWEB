/** Lower-case, accent-free text so "brasov" finds "Brașov". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** True when every word of the query appears somewhere in the fields. */
export function matchesQuery(
  query: string,
  fields: Array<string | null | undefined>,
): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(fields.filter(Boolean).join(" "));
  return words.every((word) => haystack.includes(word));
}
