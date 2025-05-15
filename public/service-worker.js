const CACHE_NAME = 'dotspark-neura-v3';
const OFFLINE_URL = '/offline.html';

// Define any global variables that might be referenced
self.network = {
  isOnline: function() {
    return self.navigator ? self.navigator.onLine : true;
  }
};

// Add any other potentially missing global objects/variables
self.plugin = {
  network: self.network
};

// Guarantee these variables exist to prevent "X is not defined" errors
self.importScripts = self.importScripts || function() { 
  console.log('[Service Worker] Ignored importScripts call');
};

// Stub common functions that might be called
self.analytics = {
  trackEvent: function() {
    // Empty stub
  }
};

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
  
  try {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('[Service Worker] Caching core assets');
          // Cache all core assets, but don't let one failure stop the whole process
          return Promise.allSettled(
            CORE_ASSETS.map(url => 
              cache.add(url).catch(error => {
                console.error(`[Service Worker] Failed to cache ${url}:`, error);
                // Continue despite error
                return Promise.resolve();
              })
            )
          );
        })
        .catch(error => {
          console.error('[Service Worker] Cache open error:', error);
          // Continue installation despite caching errors
          return Promise.resolve();
        })
    );
  } catch (error) {
    console.error('[Service Worker] Critical install error:', error);
  }
  
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  
  try {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheName !== CACHE_NAME) {
                console.log('[Service Worker] Removing old cache:', cacheName);
                return caches.delete(cacheName).catch(error => {
                  console.error(`[Service Worker] Failed to delete cache ${cacheName}:`, error);
                  // Continue despite error
                  return Promise.resolve();
                });
              }
              return Promise.resolve();
            })
          );
        })
        .catch(error => {
          console.error('[Service Worker] Cache cleanup error:', error);
          // Continue activation despite errors
          return Promise.resolve();
        })
    );
  } catch (error) {
    console.error('[Service Worker] Critical activate error:', error);
  }
  
  // Take control of all clients immediately
  try {
    self.clients.claim();
  } catch (error) {
    console.error('[Service Worker] Client claim error:', error);
  }
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  try {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip cross-origin requests (CORS will affect these anyway)
    const url = new URL(event.request.url);
    const isSameOrigin = url.origin === self.location.origin;
    
    if (!isSameOrigin) return;
    
    // Skip browser extension and chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://') || 
        event.request.url.includes('extension')) return;
    
    // Skip URLs with no extension and a query string (likely dynamic API calls)
    if (url.pathname.indexOf('.') === -1 && url.search !== '') return;
    
    // Handle specific file types or resources
    if (event.request.url.includes('/api/')) {
      // API requests - Network first, then offline fallback
      safeHandleApiRequest(event);
    } else if (
      event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|ico|json)$/) ||
      event.request.url.includes('/icons/')
    ) {
      // Static assets - Cache first, then network fallback
      safeHandleStaticAsset(event);
    } else {
      // HTML and other resources - Network first with fallback
      safeHandleHtmlRequest(event);
    }
  } catch (error) {
    console.error('[Service Worker] Critical fetch handler error:', error);
    // Don't break the user experience if something goes wrong
    // Let the browser handle the request normally
  }
});

// Handle API requests - Network first with offline fallback
function safeHandleApiRequest(event) {
  try {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          try {
            // If valid response, clone and cache it
            if (response && response.status === 200) {
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, clonedResponse)
                    .catch(error => console.error('[Service Worker] Cache put error:', error));
                })
                .catch(error => console.error('[Service Worker] Cache open error:', error));
            }
            return response;
          } catch (error) {
            console.error('[Service Worker] Response handling error:', error);
            return response; // Return original response despite error
          }
        })
        .catch(() => {
          // When offline, try to get from cache
          return caches.match(event.request)
            .then(cachedResponse => {
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
            })
            .catch(error => {
              console.error('[Service Worker] Cache match error:', error);
              // Fallback to a generic error response
              return new Response(
                JSON.stringify({ error: 'Service worker error. Please reload the app.' }),
                { 
                  status: 500, 
                  headers: new Headers({ 'Content-Type': 'application/json' }) 
                }
              );
            });
        })
    );
  } catch (error) {
    console.error('[Service Worker] API request handler error:', error);
    // Let the browser handle the request normally
  }
}

// Handle static assets - Cache first with network fallback
function safeHandleStaticAsset(event) {
  try {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then(response => {
              try {
                // If valid response, clone and cache it
                if (response && response.status === 200) {
                  const clonedResponse = response.clone();
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, clonedResponse)
                        .catch(error => console.error('[Service Worker] Cache put error:', error));
                    })
                    .catch(error => console.error('[Service Worker] Cache open error:', error));
                }
                return response;
              } catch (error) {
                console.error('[Service Worker] Response handling error:', error);
                return response; // Return original response despite error
              }
            })
            .catch(error => {
              console.error('[Service Worker] Fetch failed:', error);
              // For images, could return a default image
              if (event.request.url.match(/\.(png|jpg|jpeg|svg|ico)$/)) {
                return caches.match('/icons/icon-192x192.png')
                  .catch(() => {
                    // If even that fails, let the browser handle it
                    throw error;
                  });
              }
              // Otherwise just propagate the error
              throw error;
            });
        })
        .catch(error => {
          console.error('[Service Worker] Cache match error:', error);
          // Let the browser handle it
          throw error;
        })
    );
  } catch (error) {
    console.error('[Service Worker] Static asset handler error:', error);
    // Let the browser handle the request normally
  }
}

// Handle HTML requests - Network first with offline fallback
function safeHandleHtmlRequest(event) {
  try {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          try {
            // If valid response, clone and cache it
            if (response && response.status === 200) {
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, clonedResponse)
                    .catch(error => console.error('[Service Worker] Cache put error:', error));
                })
                .catch(error => console.error('[Service Worker] Cache open error:', error));
            }
            return response;
          } catch (error) {
            console.error('[Service Worker] Response handling error:', error);
            return response; // Return original response despite error
          }
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              // Return cached response if available
              if (cachedResponse) {
                return cachedResponse;
              }
              // Otherwise serve the offline page
              return caches.match(OFFLINE_URL)
                .catch(error => {
                  console.error('[Service Worker] Offline page fetch error:', error);
                  // Return a simple offline message if all else fails
                  return new Response(
                    'You are offline. Please reconnect to continue using DotSpark Neura.',
                    { 
                      headers: new Headers({ 'Content-Type': 'text/plain' }) 
                    }
                  );
                });
            })
            .catch(error => {
              console.error('[Service Worker] Cache match error:', error);
              // Try offline page as last resort
              return caches.match(OFFLINE_URL)
                .catch(() => {
                  // Return a simple offline message
                  return new Response(
                    'You are offline. Please reconnect to continue using DotSpark Neura.',
                    { 
                      headers: new Headers({ 'Content-Type': 'text/plain' }) 
                    }
                  );
                });
            });
        })
    );
  } catch (error) {
    console.error('[Service Worker] HTML request handler error:', error);
    // Let the browser handle the request normally
  }
}

// Listen for messages from clients
self.addEventListener('message', event => {
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  } catch (error) {
    console.error('[Service Worker] Message handling error:', error);
  }
});