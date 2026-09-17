export interface Song {
  id: string;
  title: string;
  audio_url: string;
  category: string | null;
  cover_url: string | null;
  created_at: string;
}

export type Category = 
  | 'Malayalam'
  | 'Tamil'
  | 'Hindi'
  | 'English'
  | 'Devotional'
  | 'Other';

export const STANDARD_CATEGORIES: Category[] = [
  'Malayalam',
  'Tamil',
  'Hindi',
  'English',
  'Devotional',
  'Other',
];
