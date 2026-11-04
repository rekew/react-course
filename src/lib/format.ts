/**
 * Converts a kebab-case category key into a human-readable label.
 *
 * 1. Replaces every hyphen (`-`) with a space, so `"home-decoration"`
 *    becomes `"home decoration"`.
 * 2. Matches the first letter of every word using the `\b\w` pattern
 *    (`\b` is a word boundary and `\w` is a word character) and
 *    uppercases it, so `"home decoration"` becomes `"Home Decoration"`.
 *
 * @param category - Raw kebab-case category key.
 * @returns Title-cased, space-separated category label.
 */
export function formatCategory(category: string): string {
  return category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
