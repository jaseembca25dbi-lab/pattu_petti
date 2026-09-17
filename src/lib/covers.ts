/**
 * High quality curated image resolver for Pattupetti
 * Ensures every single song, category, and playlist has a matching editorial photo.
 */

// Curated Unsplash images with warm espresso, moody rose, and cinematic aesthetic
export const EDITORIAL_IMAGES = {
  raataan: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80',
  kesariya: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=700&q=80',
  tumsehi: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=700&q=80',
  channamereya: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80',
  aedil: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=80',
  jeet: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=700&q=80',
  alkayagnik: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=700&q=80',
  pritam: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=700&q=80',
  himesh: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  shayad: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=80',
  satranga: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=700&q=80',
  samjhawan: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80',
  kallipenne: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=700&q=80',
  zillzill: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=700&q=80',
  njankettiya: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=700&q=80',
  radhimaa: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
  pavazhamalli: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=80',
  heyminnale: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=700&q=80',
  matargashti: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=700&q=80',
  agartum: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',
  gerua: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80',
  hawayein: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=700&q=80',
  pal: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80',
  heroPortrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  searchHero: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80',
  libraryPoster: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=700&q=80',
  categoryHero: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=80',
};

const CATEGORY_DEFAULT_COVERS: Record<string, string> = {
  'Arijit Singh Radio': EDITORIAL_IMAGES.aedil,
  'Mix Hit': EDITORIAL_IMAGES.tumsehi,
  'Malayalam': EDITORIAL_IMAGES.kallipenne,
  'Tamil Hit': EDITORIAL_IMAGES.radhimaa,
};

const FALLBACK_POOL = [
  EDITORIAL_IMAGES.raataan,
  EDITORIAL_IMAGES.kesariya,
  EDITORIAL_IMAGES.channamereya,
  EDITORIAL_IMAGES.aedil,
  EDITORIAL_IMAGES.jeet,
  EDITORIAL_IMAGES.alkayagnik,
  EDITORIAL_IMAGES.pritam,
  EDITORIAL_IMAGES.himesh,
  EDITORIAL_IMAGES.shayad,
  EDITORIAL_IMAGES.satranga,
  EDITORIAL_IMAGES.samjhawan,
  EDITORIAL_IMAGES.radhimaa,
  EDITORIAL_IMAGES.kallipenne,
  EDITORIAL_IMAGES.pavazhamalli,
  EDITORIAL_IMAGES.pal,
  EDITORIAL_IMAGES.hawayein,
];

/**
 * Returns a guaranteed high quality aesthetic cover photo for any song.
 */
export function getAutoCover(title: string, category?: string | null, customUrl?: string | null): string {
  if (customUrl && customUrl.trim()) {
    return customUrl;
  }

  const t = (title || '').toLowerCase();

  if (t.includes('raataan')) return EDITORIAL_IMAGES.raataan;
  if (t.includes('kesariya')) return EDITORIAL_IMAGES.kesariya;
  if (t.includes('tum se hi') || t.includes('tum se')) return EDITORIAL_IMAGES.tumsehi;
  if (t.includes('channa mereya') || t.includes('channa')) return EDITORIAL_IMAGES.channamereya;
  if (t.includes('ae dil') || t.includes('mushkil')) return EDITORIAL_IMAGES.aedil;
  if (t.includes('jeet') || t.includes('sunn raha')) return EDITORIAL_IMAGES.jeet;
  if (t.includes('alka') || t.includes('taal')) return EDITORIAL_IMAGES.alkayagnik;
  if (t.includes('pritam') || t.includes('subhanallah')) return EDITORIAL_IMAGES.pritam;
  if (t.includes('himesh') || t.includes('aashiq')) return EDITORIAL_IMAGES.himesh;
  if (t.includes('shayad')) return EDITORIAL_IMAGES.shayad;
  if (t.includes('satranga')) return EDITORIAL_IMAGES.satranga;
  if (t.includes('samjhawan')) return EDITORIAL_IMAGES.samjhawan;
  if (t.includes('kallipenne')) return EDITORIAL_IMAGES.kallipenne;
  if (t.includes('zill')) return EDITORIAL_IMAGES.zillzill;
  if (t.includes('njan kettiya') || t.includes('shafi')) return EDITORIAL_IMAGES.njankettiya;
  if (t.includes('radhimaa') || t.includes('pattampoochi')) return EDITORIAL_IMAGES.radhimaa;
  if (t.includes('pavazha') || t.includes('malli')) return EDITORIAL_IMAGES.pavazhamalli;
  if (t.includes('minnale')) return EDITORIAL_IMAGES.heyminnale;
  if (t.includes('matargashti')) return EDITORIAL_IMAGES.matargashti;
  if (t.includes('agar tum')) return EDITORIAL_IMAGES.agartum;
  if (t.includes('gerua')) return EDITORIAL_IMAGES.gerua;
  if (t.includes('hawayein')) return EDITORIAL_IMAGES.hawayein;
  if (t.includes('pal')) return EDITORIAL_IMAGES.pal;

  if (category && CATEGORY_DEFAULT_COVERS[category]) {
    return CATEGORY_DEFAULT_COVERS[category];
  }

  // Deterministic fallback based on title hash
  let hash = 0;
  for (let i = 0; i < t.length; i++) {
    hash = (hash << 5) - hash + t.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_POOL.length;
  return FALLBACK_POOL[index];
}
