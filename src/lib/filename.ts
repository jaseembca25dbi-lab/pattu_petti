/**
 * Converts a raw song filename into a clean, human-readable song title.
 * 
 * Rules:
 * 1. Remove the file extension (e.g., .mp3, .wav, .m4a, .aac, .flac).
 * 2. Strip leading track order numbers (e.g. "001_", "01 - ", "1. ", "055 ").
 * 3. Remove watermarks / downloader tags like "SpotiDost", "[SpotiDost]", "(SpotiDost)".
 * 4. Replace underscores `_` with spaces.
 * 5. Clean up duplicate hyphens and spaces.
 */
export function cleanFileNameToTitle(rawFileName: string): string {
  if (!rawFileName) return '';

  // 1. Remove extension
  let name = rawFileName.replace(/\.[^/.]+$/, '');

  // 2. Remove SpotiDost or similar tags
  name = name.replace(/[-_\s]*\[?\(?spotidost\)?\]?[-_\s]*/gi, '');

  // 3. Strip leading track number prefixes like "001_", "01 - ", "01 ", "01.", "055 "
  name = name.replace(/^\d+[\s_.-]+/, '');

  // 4. Replace underscores and hyphens with spaces
  name = name.replace(/[_-]+/g, ' ').trim();

  // 5. Clean up "From <Movie>" format nicely
  name = name.replace(/\bFrom\s+(.+)$/i, (_m, movie) => `(From ${movie})`);

  // 6. Collapse multiple spaces into clean spacing
  name = name.replace(/\s+/g, ' ').trim();

  // If after cleaning it's empty, fall back to original without extension
  if (!name) {
    name = rawFileName.replace(/\.[^/.]+$/, '').trim();
  }

  return name;
}

