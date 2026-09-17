export interface Song {
  id: string;
  title: string;
  artist?: string;
  audio_url: string;
  category: string | null;
  cover_url: string | null;
  created_at: string;
  duration?: string;
  playedAt?: string;
  isFavorite?: boolean;
}

export type Category = 
  | 'Arijit Singh Radio'
  | 'Atmospheric'
  | 'Mix Hit'
  | 'Malayalam'
  | 'Tamil Hit'
  | 'Other';

export const STANDARD_CATEGORIES: Category[] = [
  'Arijit Singh Radio',
  'Atmospheric',
  'Mix Hit',
  'Malayalam',
  'Tamil Hit',
  'Other',
];

/**
 * Intelligent artist resolver for songs based on known popular titles/filenames
 */
export function getSongArtist(title: string, category?: string | null): string {
  const t = (title || '').toLowerCase();
  
  if (t.includes('shayad') || t.includes('raataan') || t.includes('channa mereya') || 
      t.includes('kesariya') || t.includes('samjhawan') || t.includes('ranjha') || 
      t.includes('satranga') || t.includes('ae dil hai mushkil') || t.includes('tum hi ho') ||
      t.includes('hawayein') || t.includes('gerua')) {
    return 'Arijit Singh';
  }
  if (t.includes('tum se hi') || t.includes('pee loon') || t.includes('matargashti')) {
    return 'Mohit Chauhan';
  }
  if (t.includes('alka yagnik') || t.includes('taal') || t.includes('kaho naa')) {
    return 'Alka Yagnik, Arijit Singh';
  }
  if (t.includes('jeet gannguli') || t.includes('sunn raha hai')) {
    return 'Jeet Gannguli, Arijit Singh';
  }
  if (t.includes('pritam') || t.includes('subhanallah')) {
    return 'Pritam, Arijit Singh';
  }
  if (t.includes('himesh') || t.includes('aashiq banaya')) {
    return 'Himesh Reshammiya';
  }
  if (t.includes('kallipenne') || t.includes('zill') || t.includes('njan kettiya pennu') || t.includes('shafi')) {
    return 'Shafi Kollam';
  }
  if (t.includes('radhimaa') || t.includes('pattampoochi') || t.includes('pavazha malli')) {
    return 'Anirudh Ravichander';
  }
  if (t.includes('hey minnale')) {
    return 'GV Prakash Kumar';
  }
  if (t.includes('agar tum saath ho')) {
    return 'Arijit Singh, Alka Yagnik';
  }
  if (t.includes('pal')) {
    return 'Arijit Singh, Shreya Ghoshal';
  }

  if (category && category.toLowerCase().includes('shafi')) {
    return 'Shafi Kollam';
  }
  if (category && category.toLowerCase().includes('tamil')) {
    return 'Tamil Classic';
  }
  if (category && category.toLowerCase().includes('arijit')) {
    return 'Arijit Singh';
  }
  if (category && category.toLowerCase().includes('mix')) {
    return 'Bollywood & Indie';
  }
  if (category && category.toLowerCase().includes('malayalam')) {
    return 'Malayalam Hits';
  }

  return 'Original Artist';
}
