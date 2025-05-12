const CACHE_NAME = 'dotspark-neural-extension-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
  
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip browser extension and chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('extension')) return;
  
  // Handle specific file types or resources
  if (event.request.url.includes('/api/')) {
    // API requests - Network first, then offline fallback
    handleApiRequest(event);
  } else if (
    event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|ico|json)$/) ||
    event.request.url.includes('/icons/')
  ) {
    // Static assets - Cache first, then network fallback
    handleStaticAsset(event);
  } else {
    // HTML and other resources - Network first with fallback
    handleHtmlRequest(event);
  }
});

// Handle API requests - Network first with offline fallback
function handleApiRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If valid response, clone and cache it
        if (response && response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // When offline, try to get from cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If no cached response for API, return a custom offline response
          return new Response(
            JSON.stringify({ 
              error: 'You are offline. This action requires an internet connection.' 
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            }
          );
        });
      })
  );
}

// Handle static assets - Cache first with network fallback
function handleStaticAsset(event) {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, fetch from network
      return fetch(event.request).then(response => {
        // If valid response, clone and cache it
        if (response && response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      }).catch(error => {
        console.error('[Service Worker] Fetch failed:', error);
        // For images, could return a default image
        if (event.request.url.match(/\.(png|jpg|jpeg|svg|ico)$/)) {
          return caches.match('/icons/icon-192x192.png');
        }
        // Otherwise just propagate the error
        throw error;
      });
    })
  );
}

// Handle HTML requests - Network first with offline fallback
function handleHtmlRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If valid response, clone and cache it
        if (response && response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            // Return cached response if available
            if (cachedResponse) {
              return cachedResponse;
            }
            // Otherwise serve the offline page
            return caches.match(OFFLINE_URL);
          });
      })
  );
}

// Listen for messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});