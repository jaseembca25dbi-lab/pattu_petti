import React, { useState } from 'react';
import { AlertTriangle, Copy, Check, Database, X } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const SupabaseSetupNotice: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const configured = isSupabaseConfigured();

  if (configured && !showModal) return null;
  if (dismissed && !showModal) return null;

  const sqlSnippet = `-- 1. Table
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    category TEXT,
    cover_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on songs" ON public.songs FOR INSERT WITH CHECK (true);

-- 2. Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', true), ('covers', 'covers', true) ON CONFLICT (id) DO UPDATE SET public = true;
CREATE POLICY "Allow public read on music storage" ON storage.objects FOR SELECT USING (bucket_id = 'music');
CREATE POLICY "Allow public insert on music storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'music');
CREATE POLICY "Allow public read on covers storage" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Allow public insert on covers storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers');`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Top Banner when not configured */}
      {!configured && !dismissed && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Supabase Setup Required:</strong> Update your <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">.env</code> file with your Supabase credentials to enable audio streaming & uploads.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="underline font-semibold hover:text-white"
            >
              View Setup SQL & Guide
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-400/80 hover:text-amber-200"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detailed Setup Guide Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-dark-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <Database className="w-5 h-5 text-brand-400" />
                <span>Supabase Configuration Guide</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-300 overflow-y-auto pr-1">
              <div className="p-3 bg-dark-950 rounded-xl border border-white/5 space-y-2">
                <p className="font-semibold text-white">Step 1: Run SQL in Supabase SQL Editor</p>
                <p className="text-neutral-400">
                  This creates the <code className="text-brand-400">songs</code> table, plus <code className="text-brand-400">music</code> and <code className="text-brand-400">covers</code> public storage buckets.
                </p>
                <div className="relative">
                  <pre className="bg-black/60 p-3 rounded-lg text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-36">
                    {sqlSnippet}
                  </pre>
                  <button
                    onClick={copySql}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-brand-500 hover:bg-brand-400 text-black font-semibold text-[10px] flex items-center gap-1 shadow"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-dark-950 rounded-xl border border-white/5 space-y-1.5">
                <p className="font-semibold text-white">Step 2: Add credentials to .env</p>
                <p className="text-neutral-400">In project root, open or create <code className="text-brand-400">.env</code>:</p>
                <pre className="bg-black/60 p-2.5 rounded-lg text-[11px] font-mono text-brand-300">
                  {`VITE_SUPABASE_URL=https://<your-project-id>.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-or-publishable-key>`}
                </pre>
              </div>

              <div className="p-3 bg-dark-950 rounded-xl border border-white/5 space-y-1">
                <p className="font-semibold text-white">Step 3: Restart dev server</p>
                <p className="text-neutral-400">Restart <code className="text-brand-400">npm run dev</code> to reload environment variables.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-brand-500 text-black font-bold text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
