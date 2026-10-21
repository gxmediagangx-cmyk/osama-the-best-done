'use client';

import React, { useState } from 'react';
import { Dumbbell, WifiOff, Sparkles, Flame, Timer, Palette, Check } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online';
import { useMounted } from '@/hooks/use-mounted';
import { PWAInstallButton } from './PWAInstallButton';
import { AppThemeId } from '@/lib/types';
import { APP_THEMES } from '@/lib/themes';
import { soundManager } from '@/lib/sound';

interface NavbarProps {
  onOpenAIExport: () => void;
  onOpenTimer?: () => void;
  streakDays?: number;
  activeSessionDuration?: string;
  currentThemeId?: AppThemeId;
  onSelectTheme?: (themeId: AppThemeId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAIExport,
  onOpenTimer,
  streakDays = 4,
  activeSessionDuration,
  currentThemeId = 'gold',
  onSelectTheme,
}) => {
  const isOnline = useOnlineStatus();
  const mounted = useMounted();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-[54px] border-b border-white/[0.06] bg-[#0b0b0e]/95 backdrop-blur-2xl">
      <div className="mx-auto flex h-full max-w-[430px] items-center justify-between gap-1.5 px-3.5 relative">
        {/* Brand & Personal Signature */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-[#16161c] border border-[#d4b26f]/40 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/app-avatar.jpg"
              alt="Osama The Best"
              className="h-full w-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div suppressHydrationWarning className="flex items-center gap-1.5 min-w-0">
              <span className="truncate text-[15px] font-bold tracking-tight text-white leading-none">
                Osama
              </span>

              {mounted && !isOnline && (
                <span className="flex items-center gap-1 rounded bg-[#d4b26f]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#d4b26f] shrink-0">
                  <WifiOff className="w-2.5 h-2.5" />
                  OFFLINE
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 whitespace-nowrap">
              <span className="flex items-center gap-1 text-[#d4b26f] font-semibold">
                <Flame className="w-3 h-3 fill-[#d4b26f] stroke-none shrink-0" />
                {streakDays}d Streak
              </span>
              {activeSessionDuration && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span suppressHydrationWarning className="font-mono text-zinc-200 font-semibold">{activeSessionDuration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions (Compact so they never collide with Osama brand on mobile) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Theme Picker Button */}
          {onSelectTheme && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClickPop();
                  setIsThemeMenuOpen(!isThemeMenuOpen);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-[#16161c] text-[#d4b26f] hover:border-[#d4b26f]/50 active:scale-95 transition touch-manipulation cursor-pointer"
                title="Switch UI Color Theme"
              >
                <Palette className="w-3.5 h-3.5 shrink-0" />
              </button>

              {isThemeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsThemeMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-white/15 bg-[#14141a] p-3 shadow-2xl">
                    <div className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2 px-1">
                      UI Color Themes ({APP_THEMES.length})
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto no-scrollbar">
                      {APP_THEMES.map((theme) => {
                        const isActive = currentThemeId === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              soundManager.playClickPop();
                              onSelectTheme(theme.id);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition cursor-pointer ${
                              isActive
                                ? 'border-white/40 bg-white/10 text-white font-bold'
                                : 'border-white/[0.06] bg-black/30 text-zinc-300 hover:bg-white/[0.06]'
                            }`}
                          >
                            <span
                              className="h-4 w-4 shrink-0 rounded-full border border-white/20 flex items-center justify-center"
                              style={{ backgroundColor: theme.accent }}
                            >
                              {isActive && <Check className="w-2.5 h-2.5 text-black stroke-[3.5]" />}
                            </span>
                            <span className="truncate text-xs">{theme.name.split(' ')[1] || theme.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Rest Timer Trigger Button */}
          {onOpenTimer && (
            <button
              type="button"
              onClick={onOpenTimer}
              className="flex h-8 items-center gap-1 whitespace-nowrap rounded-xl border border-white/15 bg-[#16161c] px-2 text-[11px] font-bold text-zinc-200 hover:text-white hover:border-[#d4b26f]/50 active:scale-95 transition touch-manipulation cursor-pointer"
              title="Open Rest Timer Console"
            >
              <Timer className="w-3.5 h-3.5 text-[#d4b26f] shrink-0" />
              <span>Timer</span>
            </button>
          )}

          {/* AI Export Tool */}
          <button
            type="button"
            onClick={onOpenAIExport}
            className="flex h-8 items-center gap-1 whitespace-nowrap rounded-xl border border-[#d4b26f]/35 bg-[#16161c] px-2 text-[11px] font-bold text-[#eed891] hover:bg-[#d4b26f]/10 hover:border-[#d4b26f]/50 active:scale-95 transition touch-manipulation cursor-pointer"
            title="Copy or download daily training report"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4b26f] shrink-0" />
            <span>Report</span>
          </button>

          {/* PWA Install */}
          <PWAInstallButton compact />
        </div>
      </div>
    </header>
  );
};
