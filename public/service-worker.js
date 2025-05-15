// Absolute minimum service worker with no functionality at all
// Just exists to make the app installable as a PWA

// For debugging - log the complete global object
// console.log('Service worker global object:', self);

// Install handler - do nothing but skipWaiting
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing service worker');
  self.skipWaiting();
});

// Activate handler - do nothing but claim clients
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating service worker');
  self.clients.claim();
});

// No fetch handler - we don't want to intercept any network requests

// No message handler - we don't need to receive any messages