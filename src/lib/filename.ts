/**
 * Converts a raw song filename into a clean, human-readable song title.
 */
export function cleanFileNameToTitle(rawFileName: string): string {
  if (!rawFileName) return '';
  const { title } = parseFilenameArtistTitle(rawFileName);
  return title || rawFileName.replace(/\.[^/.]+$/, '');
}

/**
 * Extracts artist name and song title from various filename patterns accurately.
 * Handles:
 * - "Artist Name - Song Title (SPOTISAVER).mp3"
 * - "01. Artist Name - Song Title [320kbps].mp3"
 * - "01_Song_Title.mp3"
 * - "Song Title (From Movie).mp3"
 */
export function parseFilenameArtistTitle(rawFileName: string): { title: string; artist: string } {
  if (!rawFileName) return { title: '', artist: '' };

  // 1. Remove file extension
  let name = rawFileName.replace(/\.[^/.]+$/, '');

  // 2. Remove common ripper/website watermarks & downloader tags
  name = name.replace(/[-_\s]*[\[({]?\s*(SPOTISAVER|spotidost|pagalworld|paglasongs|masstamilan|sensongs|naasongs|starjam|mobcup|pendujatt|djpunjab|mr-jatt|isaimini|kuttyweb|songs\.pk)\s*[\])}]?[-_\s]*/gi, ' ');

  // 3. Remove quality/format tags like [320kbps], (128 Kbps), [HQ], [FLAC], (Official Audio), (Lyric Video)
  name = name.replace(/[-_\s]*[\[({]?\s*(\d{2,3}\s*kbps|HQ|FLAC|HD|Official Audio|Official Video|Lyric Video|Lyrical|Audio|Full Video Song|Video Song|Video|4K|8K)\s*[\])}]?[-_\s]*/gi, ' ');

  // 4. Clean leading track numbers like "001_", "01. ", "01 - ", "1. ", "055 "
  name = name.replace(/^(\d{1,3}[\s._-]+)+/i, '');

  // 5. Replace underscores with spaces (except if part of artist delimiter)
  name = name.replace(/_/g, ' ');

  // 6. Clean duplicate spaces and hyphens
  name = name.replace(/\s+/g, ' ').replace(/-{2,}/g, '-').trim();

  // 7. Split artist and title if delimiter exists (" - ", " – ", " — ", " | ")
  const delimiters = [' - ', ' – ', ' — ', ' | '];
  for (const delim of delimiters) {
    const idx = name.indexOf(delim);
    if (idx > 0) {
      const artist = name.substring(0, idx).trim();
      let title = name.substring(idx + delim.length).trim();
      // Clean up "From <Movie>" format in title
      title = title.replace(/\s*\(From\s+([^)]+)\)/i, ' (From $1)').trim();
      return { artist, title };
    }
  }

  // No delimiter found — return clean name as title
  return { artist: '', title: name };
}

/**
 * Normalises a storage folder name into a proper Category display name.
 */
export function folderToCategory(folderName: string): string {
  const map: Record<string, string> = {
    'arjith sing radio': 'Arijit Singh Radio',
    'arijit singh radio': 'Arijit Singh Radio',
    'arijith singh radio': 'Arijit Singh Radio',
    'mix hit': 'Mix Hit',
    'shafi kollam radio': 'Shafi Kollam Radio',
    'tamil hit': 'Tamil Hit',
    'malayalam': 'Malayalam',
    'bollywood': 'Bollywood',
    'trending bollywood': 'Bollywood',
  };
  const lower = (folderName || '').toLowerCase().trim();
  if (map[lower]) return map[lower];
  // Title-case fallback
  return lower.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
