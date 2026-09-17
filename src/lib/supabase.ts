import { createClient } from '@supabase/supabase-js';

export const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://vrkwawzcvepqqxxlyfwx.supabase.co';
export const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_IELmJvfo7hs4YpjX869YuQ_-Q0zJInn';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(rawSupabaseUrl) &&
    Boolean(supabaseKey) &&
    !rawSupabaseUrl.includes('your-project-id') &&
    !supabaseKey.includes('your-anon-or-publishable-key')
  );
};

// If a secret key (sb_secret_...) is used during local dev, route through Vite proxy
// to prevent browser CORS/Origin rejection, while publishable keys connect directly.
const getEffectiveUrl = (): string => {
  if (!isSupabaseConfigured()) return 'https://placeholder.supabase.co';

  if (
    import.meta.env.DEV &&
    supabaseKey.startsWith('sb_secret_') &&
    typeof window !== 'undefined'
  ) {
    return `${window.location.origin}/supabase-proxy`;
  }

  return rawSupabaseUrl;
};

export const supabase = createClient(
  getEffectiveUrl(),
  isSupabaseConfigured() ? supabaseKey : 'placeholder-key'
);
