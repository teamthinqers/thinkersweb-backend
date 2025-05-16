/**
 * Initialize Progressive Web App functionality
 * Registers the service worker for offline capabilities
 */
export function initPWA() {
  console.log('Initializing PWA functionality');
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Set up update checking
          setInterval(() => {
            registration.update()
              .then(() => console.log('Service Worker checked for updates'))
              .catch(error => console.error('Error checking for Service Worker updates:', error));
          }, 60 * 60 * 1000); // Check for updates every hour
          
          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is installed and ready to take over
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
    
    // Add a listener for when the service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
    });
  } else {
    console.log('Service Workers are not supported in this browser');
  }
}

/**
 * Prompt the user to install the PWA
 */
export function promptInstall() {
  const deferredPrompt = (window as any).deferredPrompt;
  if (!deferredPrompt) {
    console.log('Cannot prompt to install: install prompt not available');
    return;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // Clear the deferredPrompt variable
    (window as any).deferredPrompt = null;
  });
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