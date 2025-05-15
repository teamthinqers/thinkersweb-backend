export function initPWA() {
  // Check if the browser supports service workers
  if ('serviceWorker' in navigator) {
    console.log('Service worker is supported, preparing to register');
    
    // Register the service worker - do it immediately instead of waiting for window.load
    try {
      // We're trying to register the service worker as soon as possible
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('✅ Service Worker registered successfully with scope:', registration.scope);
          
          // Check for updates to the service worker
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              console.log('Service worker installation in progress...');
              
              installingWorker.onstatechange = () => {
                console.log(`Service worker state changed: ${installingWorker.state}`);
                
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // At this point, the updated precached content has been fetched,
                    // but the previous service worker will still serve the older
                    // content until all client tabs are closed.
                    console.log('✅ New content is available and will be used when all tabs for this page are closed.');
                    
                    // Optionally, show a notification to the user about the update
                    showUpdateNotification();
                  } else {
                    // At this point, everything has been precached.
                    // It's the perfect time to display a "Content is cached for offline use." message.
                    console.log('✅ Content is cached for offline use.');
                  }
                }
              };
            }
          };
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
          
          // Try again after a delay
          setTimeout(() => {
            console.log('Attempting to register service worker again...');
            navigator.serviceWorker.register('/service-worker.js')
              .then(reg => console.log('✅ Service Worker registered on retry with scope:', reg.scope))
              .catch(err => console.error('❌ Service Worker registration failed again:', err));
          }, 3000);
        });
    } catch (error) {
      console.error('❌ Critical error registering service worker:', error);
    }
    
    // Also register on window load as a fallback
    window.addEventListener('load', () => {
      // Check if service worker is already registered
      if (navigator.serviceWorker.controller) {
        console.log('Service worker is already controlling this page on window.load');
      } else {
        console.log('Attempting to register service worker on window.load event...');
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('✅ Service Worker registered on window.load with scope:', reg.scope))
          .catch(err => console.error('❌ Service Worker registration failed on window.load:', err));
      }
    });
  } else {
    console.log('⚠️ Service workers are not supported by this browser.');
  }
}

function showUpdateNotification() {
  // You could implement this using your UI components
  // For example with toast notifications from your UI library
  const event = new CustomEvent('pwa-update-available', {
    detail: {
      message: 'A new version is available. Close all tabs to update.',
      type: 'info'
    }
  });
  
  window.dispatchEvent(event);
}

/**
 * Function to determine if the app is running in standalone mode (installed PWA)
 */
export function isRunningAsStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true || // iOS Safari
    window.location.search.includes('standalone=true') // For testing
  );
}

/**
 * Check if the app is running offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Add event listeners for online/offline status changes
 * @param onOnline Callback for when the app goes online
 * @param onOffline Callback for when the app goes offline
 */
export function setupConnectivityMonitoring(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  const handleOnline = () => {
    console.log('App is online');
    onOnline?.();
  };
  
  const handleOffline = () => {
    console.log('App is offline');
    onOffline?.();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Prompt the user to reload for a new service worker version
 */
export function promptUserToReload(): void {
  // First check if there's a service worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Send a message to the service worker to skip waiting
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    
    // Then reload the page to activate the new service worker
    window.location.reload();
  }
}

/**
 * Force browser to reload from the server and ignore the cache
 */
export function forceRefreshFromServer(): void {
  window.location.reload();
}