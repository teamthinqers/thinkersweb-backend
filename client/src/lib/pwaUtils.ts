/**
 * Initialize Progressive Web App functionality
 * This function handles PWA-related setup
 * NOTE: Service worker functionality is currently disabled due to compatibility issues
 */
export function initPWA() {
  // Add PWA installation detection
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Store the event so it can be triggered later
    (window as any).deferredPrompt = e;
    console.log('PWA install prompt is available');
    
    // Optionally show your own install button or UI element here
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', promptInstall);
    }
  });

  // After successful installation
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt
    (window as any).deferredPrompt = null;
    console.log('PWA was installed successfully');
    
    // Hide the install button if it exists
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  });

  // Prepare PWA manifest check
  fetch('/manifest.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Manifest fetch failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ Manifest loaded successfully:', data.name);
    })
    .catch(error => {
      console.error('❌ Error loading manifest:', error);
    });
  
  // Disable service worker functionality
  if ('serviceWorker' in navigator) {
    console.log('Service worker is supported, unregistering any existing service workers');
    
    // Unregister all service workers
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister()
          .then(() => console.log('Unregistered existing service worker'))
          .catch(err => console.error('Failed to unregister service worker:', err));
      }
    }).catch(err => {
      console.error('Could not get service worker registrations:', err);
    });
    
    // For development, we've disabled service workers to prevent runtime errors
    console.log('Service worker functionality is currently disabled');
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