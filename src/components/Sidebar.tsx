import React from 'react';
import { Sparkles, Disc, Radio } from 'lucide-react';

export type NavTab = 'home' | 'search' | 'library' | 'category';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  selectedCollection?: string | null;
  onSelectCollection?: (collection: string) => void;
  availableCollections?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  selectedCollection,
  onSelectCollection,
  availableCollections = ['Arijit Singh Radio', 'Mix Hit', 'Malayalam', 'Tamil Hit'],
}) => {
  const mainNavItems = [
    { id: 'home' as NavTab, number: '01', label: 'HOME' },
    { id: 'search' as NavTab, label: 'SEARCH', number: '02' },
    { id: 'library' as NavTab, label: 'LIBRARY', number: '03' },
  ];

  // Dynamic bottom quote depending on active screen
  const getSidebarQuote = () => {
    if (activeTab === 'search') return 'Find what moves you.';
    if (activeTab === 'library') return 'Every song a story.';
    if (activeTab === 'category') return 'Same Vibes Different Stories.';
    return 'Music for a better you.';
  };

  return (
    <aside className="w-64 bg-[#0e0a0d] border-r border-[#e29d8f]/10 flex flex-col justify-between p-5 select-none h-full overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div 
          onClick={() => {
            if (onSelectCollection) onSelectCollection('');
            onSelectTab('home');
          }}
          className="px-2 py-4 mb-6 border-b border-[#e29d8f]/10 cursor-pointer group"
        >
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-[#e29d8f] group-hover:rotate-12 transition-transform" />
            <h1 className="font-display text-3xl tracking-widest text-white leading-none group-hover:text-[#f5bcaf] transition-colors">
              PATTUPETTI
            </h1>
          </div>
          <p className="text-[9px] font-semibold tracking-[0.25em] text-[#e29d8f]/70 uppercase">
            PERSONAL MUSIC BOX
          </p>
        </div>

        {/* Main Navigation (01 HOME, 02 SEARCH, 03 LIBRARY) */}
        <nav className="space-y-1.5 mb-8">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onSelectCollection) onSelectCollection('');
                  onSelectTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-[#311b26] text-[#f5bcaf] border border-[#e29d8f]/30 shadow-md shadow-black/40'
                    : 'text-[#ab9398] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono ${isActive ? 'text-[#e29d8f]' : 'text-[#7e676b]'}`}>
                    {item.number}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#e29d8f]" />}
              </button>
            );
          })}
        </nav>

        {/* YOUR COLLECTION */}
        <div className="space-y-2">
          <div className="px-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#a88d92] uppercase">
              YOUR COLLECTION
            </span>
            <Sparkles className="w-3 h-3 text-[#e29d8f]/50" />
          </div>

          <div className="space-y-0.5">
            {availableCollections.map((col) => {
              const isColActive = activeTab === 'category' && selectedCollection?.toLowerCase() === col.toLowerCase();
              return (
                <button
                  key={col}
                  onClick={() => {
                    if (onSelectCollection) onSelectCollection(col);
                    onSelectTab('category');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left truncate ${
                    isColActive
                      ? 'bg-[#311b26] text-[#f5bcaf] border-l-2 border-[#e29d8f] pl-3.5'
                      : 'text-[#9c8489] hover:text-[#f5ebe6] hover:bg-white/[0.02]'
                  }`}
                >
                  <Disc className={`w-3.5 h-3.5 flex-shrink-0 ${isColActive ? 'text-[#e29d8f]' : 'text-[#6b5559]'}`} />
                  <span className="truncate">{col}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Aesthetic Quote Card */}
      <div className="mt-8 pt-4 border-t border-[#e29d8f]/10">
        <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br from-[#1d1219] to-[#120b10] border border-[#e29d8f]/15 shadow-xl group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#e29d8f]/10 rounded-full blur-xl pointer-events-none" />
          <p className="font-script text-2xl text-[#f5bcaf] leading-tight drop-shadow-sm transition-all duration-300">
            {getSidebarQuote()}
          </p>
          <div className="mt-3 flex items-center justify-between text-[9px] text-[#a88d92] tracking-widest uppercase">
            <span>Pattupetti Radio</span>
            <span className="text-[#e29d8f]">✦ 2026</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
