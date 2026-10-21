'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useMounted } from '@/hooks/use-mounted';
import { Download, Smartphone, X, Share2, PlusSquare, CheckCircle2, MoreVertical } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
  variant?: 'navbar' | 'card' | 'button';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  // Already running as standalone installed app on the phone
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-[#d4b26f]/10 border border-[#d4b26f]/25 p-3 text-xs text-[#eed891]">
          <CheckCircle2 className="w-4 h-4 text-[#d4b26f] shrink-0" />
          <span>App is installed and running in offline standalone mode.</span>
        </div>
      );
    }
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'card' ? (
        <div className="rounded-2xl border border-[#d4b26f]/40 bg-gradient-to-b from-[#14141a] to-[#0f0f14] p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4b26f]/15 border border-[#d4b26f]/30 text-[#d4b26f]">
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Download App to Phone</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Install onto your iPhone or Android home screen for 100% offline access.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAction}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#d4b26f] py-2.5 px-4 text-xs font-black uppercase text-black hover:bg-[#e2c487] active:scale-[0.98] transition cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isInstallable ? 'Install App Now' : isIOS ? 'Install on iPhone' : 'How to Download'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="rounded-xl border border-white/10 bg-[#181820] py-2.5 px-3 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
            >
              Instructions
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAction}
          className={`flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer ${
            compact
              ? 'h-8 px-2.5 text-[11px] bg-[#d4b26f] text-black hover:bg-[#e2c487] shadow-sm'
              : 'px-3 py-1.5 text-xs bg-[#d4b26f] text-black hover:bg-[#e2c487]'
          }`}
          title="Install Osama The Best to your phone home screen"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Install</span>
        </button>
      )}

      {/* Guide Modal for both iPhone (iOS Safari) and Android (Chrome) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d4b26f]/15 flex items-center justify-center text-[#d4b26f]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Download to Your Phone</h3>
                  <p className="text-[11px] text-zinc-400">Offline PWA Installation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-zinc-300">
              {isIOS ? (
                <>
                  <div className="rounded-lg bg-[#d4b26f]/10 p-2 text-[11px] font-semibold text-[#eed891]">
                    📱 iPhone / iPad (Safari)
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl bg-zinc-900/90 p-3 border border-white/5">
                    <div className="rounded-lg bg-[#d4b26f]/15 p-1.5 text-[#d4b26f] shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white">Step 1:</span> Tap the <strong>Share</strong> button (box with arrow) at the bottom of Safari.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl bg-zinc-900/90 p-3 border border-white/5">
                    <div className="rounded-lg bg-[#d4b26f]/15 p-1.5 text-[#d4b26f] shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white">Step 2:</span> Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-[#d4b26f]/10 p-2 text-[11px] font-semibold text-[#eed891]">
                    🤖 Android (Chrome / Samsung)
                  </div>
                  {isInstallable ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await install();
                        setShowModal(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#d4b26f] py-2.5 text-xs font-bold text-black"
                    >
                      <Download className="w-4 h-4" />
                      <span>Trigger 1-Tap Install</span>
                    </button>
                  ) : null}
                  <div className="flex items-start gap-2.5 rounded-xl bg-zinc-900/90 p-3 border border-white/5">
                    <div className="rounded-lg bg-[#d4b26f]/15 p-1.5 text-[#d4b26f] shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white">Step 1:</span> Tap the <strong>three dots (⋮)</strong> menu in the top right of Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl bg-zinc-900/90 p-3 border border-white/5">
                    <div className="rounded-lg bg-[#d4b26f]/15 p-1.5 text-[#d4b26f] shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white">Step 2:</span> Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </div>
                  </div>
                </>
              )}

              <div className="rounded-xl bg-black/40 p-3 border border-white/5 text-[11px] text-zinc-400">
                <p>
                  ⚡ <strong>100% Offline:</strong> Once added to your home screen, the app runs without internet, without browser URL bars, and loads with zero latency.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-4 w-full rounded-xl bg-zinc-800 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
