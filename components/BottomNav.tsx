'use client';

import React from 'react';
import { Dumbbell, Swords, Utensils, History, SlidersHorizontal } from 'lucide-react';

export type ActiveTab = 'workouts' | 'boxing' | 'meals' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingSetsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingSetsCount = 0,
}) => {
  const tabs = [
    {
      id: 'workouts' as ActiveTab,
      label: 'Workout',
      icon: Dumbbell,
      badge: pendingSetsCount > 0 ? `${pendingSetsCount}` : undefined,
    },
    {
      id: 'boxing' as ActiveTab,
      label: 'Boxing',
      icon: Swords,
    },
    {
      id: 'meals' as ActiveTab,
      label: 'Nutrition',
      icon: Utensils,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Analytics',
      icon: History,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0c0c10]/95 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur-2xl touch-manipulation select-none">
      <div className="mx-auto flex max-w-[430px] items-center justify-around px-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex flex-1 flex-col items-center justify-center py-2 transition-colors active:scale-95 min-h-[52px] touch-manipulation cursor-pointer ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'text-[#d4b26f] stroke-[2.2] scale-105' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span suppressHydrationWarning className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d4b26f] px-1 font-mono text-[10px] font-black text-black">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`mt-1 text-[11px] font-semibold tracking-tight transition-colors ${
                  isActive ? 'text-[#eed891] font-bold' : 'text-zinc-400'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-0.5 h-0.5 w-4 rounded-full bg-[#d4b26f]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
