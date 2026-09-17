/**
 * Converts a raw song filename into a clean, human-readable song title.
 * 
 * Rules:
 * 1. Remove the file extension (e.g., .mp3, .wav, .m4a, .aac, .flac).
 * 2. Strip leading track order numbers (e.g. "001_", "01 - ", "1. ", "055 ").
 * 3. Remove watermarks / downloader tags like "SpotiDost", "SPOTISAVER", "(SPOTISAVER)".
 * 4. Replace underscores `_` with spaces.
 * 5. Clean up duplicate hyphens and spaces.
 */
export function cleanFileNameToTitle(rawFileName: string): string {
  if (!rawFileName) return '';
  const { title } = parseFilenameArtistTitle(rawFileName);
  return title || rawFileName.replace(/\.[^/.]+$/, '');
}

/**
 * Extracts artist name and song title from a filename pattern like:
 * "Artist Name, Other Artist - Song Title (SPOTISAVER).mp3"
 * Returns { title, artist }
 */
export function parseFilenameArtistTitle(rawFileName: string): { title: string; artist: string } {
  // Remove extension and watermarks first
  let name = rawFileName.replace(/\.[^/.]+$/, '');
  name = name.replace(/[-_\s]*[\[({]?SPOTISAVER[\])}]?[-_\s]*/gi, '').trim();
  name = name.replace(/[-_\s]*[\[({]?spotidost[\])}]?[-_\s]*/gi, '').trim();
  name = name.replace(/\s+/g, ' ').trim();

  // Pattern: "Artist(s) - Song Title" — split on first " - "
  const dashIdx = name.indexOf(' - ');
  if (dashIdx > 0) {
    const artist = name.substring(0, dashIdx).trim();
    let title = name.substring(dashIdx + 3).trim();
    // Clean up "From <Movie>" in title
    title = title.replace(/\s*\(From\s+([^)]+)\)/i, ' (From $1)').trim();
    return { artist, title };
  }

  // No dash pattern — use the whole name as title
  return { artist: '', title: name };
}

/**
 * Normalises a storage folder name into a proper Category display name.
 * e.g. "arjith sing radio" → "Arijit Singh Radio"
 */
export function folderToCategory(folderName: string): string {
  const map: Record<string, string> = {
    'arjith sing radio': 'Arijit Singh Radio',
    'arijit singh radio': 'Arijit Singh Radio',
    'arijith sing radio': 'Arijit Singh Radio',
    'mix hit': 'Mix Hit',
    'shafi kollam radio': 'Shafi Kollam Radio',
    'tamil hit': 'Tamil Hit',
    'malayalam': 'Malayalam',
  };
  const lower = folderName.toLowerCase().trim();
  if (map[lower]) return map[lower];
  // Title-case fallback
  return lower.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
