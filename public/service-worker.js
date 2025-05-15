// Simple service worker with minimal functionality
const CACHE_NAME = 'dotspark-minimal-v1';

// Set up necessary global variables to prevent runtime errors
self.network = { isOnline: () => true };
self.plugin = { network: self.network };
self.analytics = { trackEvent: () => {} };
self.importScripts = self.importScripts || (() => {});

// Install event
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  self.clients.claim();
});

// Skip fetch intercepting completely to avoid any runtime errors
// The service worker will still make the app installable as a PWA
// but won't cache or intercept network requests

// Listen for messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});