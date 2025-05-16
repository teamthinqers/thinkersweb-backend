// Service Worker for DotSpark Neura PWA
const CACHE_NAME = 'dotspark-neura-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// Install event - precache key assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch((error) => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');
  
  // Claim clients to ensure the service worker controls all clients immediately
  event.waitUntil(self.clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests and browser sync events
  if (request.method !== 'GET' || request.url.includes('browser-sync')) {
    return;
  }
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle API requests differently - network first, then offline fallback
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
  
  // For navigation requests (HTML pages) - network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // For all other assets - cache first, network fallback
  event.respondWith(cacheFirstWithNetworkFallback(request));
});

// Cache-first strategy with network fallback
async function cacheFirstWithNetworkFallback(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached response
    return cachedResponse;
  }
  
  try {
    // If not in cache, try network
    const networkResponse = await fetch(request);
    
    // Clone the response before returning it
    const responseToCache = networkResponse.clone();
    
    // Cache the response for future
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put(request, responseToCache);
      });
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch error:', error);
    // Could return a default fallback image or other resource
    return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
}

// Network-first strategy with offline fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Clone the response before returning it
    const responseToCache = networkResponse.clone();
    
    // Cache the successful API response
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put(request, responseToCache);
      });
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Return cached response
      return cachedResponse;
    }
    
    // Return offline JSON for API endpoints
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: 'You are currently offline. Please check your connection and try again.'
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}