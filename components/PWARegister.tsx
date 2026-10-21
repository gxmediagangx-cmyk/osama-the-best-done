'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker for offline support and mobile installability
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Immediately check for updates
        registration.update().catch(() => {});

        // Check for updates periodically
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available and ready for next visit
                console.log('[PWA] Service Worker updated successfully');
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn('[PWA] ServiceWorker registration note:', err);
      });
  }, []);

  return null;
}
