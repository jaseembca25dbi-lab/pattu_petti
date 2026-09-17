-- ==========================================================
-- Pattupetti Supabase Database & Storage Setup Script
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==========================================================

-- 1. Create the `songs` table
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    category TEXT,
    cover_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure category column exists if table was created previously without it
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS category TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to songs
CREATE POLICY "Allow public read on songs" 
ON public.songs 
FOR SELECT 
USING (true);

-- Allow public inserts for uploading songs
CREATE POLICY "Allow public insert on songs" 
ON public.songs 
FOR INSERT 
WITH CHECK (true);

-- Allow public delete on songs (optional, for management)
CREATE POLICY "Allow public delete on songs" 
ON public.songs 
FOR DELETE 
USING (true);

-- 2. Create Storage Buckets `music` and `covers`
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('music', 'music', true),
    ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies for `music` bucket
CREATE POLICY "Allow public read on music storage" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'music');

CREATE POLICY "Allow public insert on music storage" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'music');

-- 4. Storage Policies for `covers` bucket
CREATE POLICY "Allow public read on covers storage" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'covers');

CREATE POLICY "Allow public insert on covers storage" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'covers');
