/**
 * Converts a raw song filename into a clean, human-readable song title.
 * 
 * Rules:
 * 1. Remove the file extension (e.g., .mp3, .wav, .m4a, .aac, .flac).
 * 2. Strip leading track order numbers if separated by delimiters (e.g. "01_", "01 - ", "1. ").
 * 3. Replace underscores `_` with spaces.
 * 4. Replace hyphens `-` with spaces.
 * 5. Collapse multi-spaces and trim.
 * 6. Never invent fake metadata.
 */
export function cleanFileNameToTitle(rawFileName: string): string {
  if (!rawFileName) return '';

  // 1. Remove extension
  let name = rawFileName.replace(/\.[^/.]+$/, '');

  // 2. Strip leading track number prefixes like "01_", "01 - ", "01 ", "01." if followed by title
  name = name.replace(/^\d+[\s_.-]+/, '');

  // 3. Replace underscores and hyphens with spaces
  name = name.replace(/[_-]+/g, ' ');

  // 4. Collapse multiple spaces into one and trim
  name = name.replace(/\s+/g, ' ').trim();

  // If after cleaning it's empty, fall back to original without extension
  if (!name) {
    name = rawFileName.replace(/\.[^/.]+$/, '').trim();
  }

  return name;
}
