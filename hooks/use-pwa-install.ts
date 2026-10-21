'use client';

import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hasPromptInstalled, setHasPromptInstalled] = useState(false);

  const subscribeStandalone = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') return () => {};
    const media = window.matchMedia('(display-mode: standalone)');
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
  }, []);

  const getStandaloneSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  }, []);

  const isStandalone = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, () => false);

  const isIOS = useSyncExternalStore(
    () => () => {},
    () => (typeof window !== 'undefined' ? /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) : false),
    () => false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setHasPromptInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setHasPromptInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  const isInstalled = isStandalone || hasPromptInstalled;

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}
