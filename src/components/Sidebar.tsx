import React from 'react';
import { Home, Search, Library, Radio } from 'lucide-react';

export type NavTab = 'home' | 'search' | 'library';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'search' as NavTab, label: 'Search', icon: Search },
    { id: 'library' as NavTab, label: 'Your Library', icon: Library },
  ];

  return (
    <aside className="w-64 bg-dark-950/80 border-r border-white/5 flex flex-col justify-between p-5 select-none h-full">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Radio className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Pattupetti</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium">Personal Music Box</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Info */}
      <div className="pt-4 border-t border-white/5">
        <div className="px-3 py-2 rounded-xl bg-dark-900/60 border border-white/5 text-[11px] text-neutral-400 leading-relaxed">
          <p className="font-semibold text-neutral-300 mb-0.5">Direct Cloud Sync</p>
          <p>Songs load automatically from Supabase Storage.</p>
        </div>
      </div>
    </aside>
  );
};
