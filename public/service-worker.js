// DotSpark Service Worker
const CACHE_NAME = 'dotspark-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Cache first with network fallback strategy for non-API requests
async function cacheFirstWithNetworkFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // First, try to get from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Clone the response as it can only be consumed once
    const responseToCache = networkResponse.clone();
    
    // Cache the network response for future use (if it's a valid response)
    if (networkResponse.status === 200) {
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests if there's a network error
    if (request.mode === 'navigate') {
      return cache.match('/offline.html');
    }
    
    // For other requests, just throw the error
    throw error;
  }
}

// Network first with cache fallback strategy for API requests
async function networkFirstWithCacheFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // First, try to get from network
    const networkResponse = await fetch(request);
    
    // Clone the response as it can only be consumed once
    const responseToCache = networkResponse.clone();
    
    // Cache the network response for future use (if it's a valid response)
    if (networkResponse.status === 200) {
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try to get from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, propagate the error
    throw error;
  }
}

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Use different strategies for API vs static resources
  if (url.pathname.startsWith('/api/')) {
    // Network-first strategy for API requests
    event.respondWith(networkFirstWithCacheFallback(request));
  } else {
    // Cache-first strategy for static resources
    event.respondWith(cacheFirstWithNetworkFallback(request));
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.actionUrl || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        const url = event.notification.data.url;
        
        // If there's a window already open, focus it
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});