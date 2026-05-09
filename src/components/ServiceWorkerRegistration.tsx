'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'activated' &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker activated - could show update toast here
                  console.log('New SW activated, refresh for updates');
                }
              });
            }
          });
        })
        .catch((error) => {
          // Service worker registration is optional - don't break the app
          console.log('SW registration failed (non-critical):', error.message);
        });
    }
  }, []);

  return null;
}
