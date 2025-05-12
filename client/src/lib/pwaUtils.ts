// PWA Utilities

// Check if service workers are supported
export const isServiceWorkerSupported = 'serviceWorker' in navigator;

// Check if the app is already installed
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

// Register service worker
export async function registerServiceWorker(): Promise<void> {
  if (!isServiceWorkerSupported) {
    console.warn('Service workers are not supported by this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered with scope:', registration.scope);
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is installed and ready to take over
            notifyUserOfUpdate();
          }
        });
      }
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

// Function to notify users of an available update
function notifyUserOfUpdate(): void {
  // You can use your toast notification system here
  console.log('New version available! Refresh to update.');
  
  // Or you can use the custom event system to notify React components
  const event = new CustomEvent('pwaUpdateAvailable');
  window.dispatchEvent(event);
}

// Check if the app can be installed
export function checkInstallability(): Promise<boolean> {
  return new Promise((resolve) => {
    if (isPWAInstalled()) {
      resolve(false);
      return;
    }
    
    const handler = () => {
      resolve(true);
      window.removeEventListener('beforeinstallprompt', handler);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Resolve false after a short timeout if the event wasn't triggered
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(false);
    }, 1000);
  });
}

// Reference to the deferred prompt event
let deferredPrompt: any;

// Set up the install prompt event handler
export function setupInstallHandler(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    event.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = event;
    
    // Notify any listeners that the app is installable
    const installableEvent = new CustomEvent('pwaInstallable');
    window.dispatchEvent(installableEvent);
  });
  
  // Handle app installed event
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    // Log or track the installation
    console.log('DotSpark was installed');
    
    // Notify any listeners that the app was installed
    const installedEvent = new CustomEvent('pwaInstalled');
    window.dispatchEvent(installedEvent);
  });
}

// Show the install prompt
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.warn('No install prompt available');
    return false;
  }
  
  // Show the prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const choiceResult = await deferredPrompt.userChoice;
  
  // Clear the deferred prompt
  deferredPrompt = null;
  
  // Return true if the user accepted the prompt
  return choiceResult.outcome === 'accepted';
}

// Initialize PWA features
export function initPWA(): void {
  registerServiceWorker();
  setupInstallHandler();
}

// Subscribe to push notifications (requires server implementation)
export async function subscribeToPushNotifications(): Promise<string | null> {
  if (!isServiceWorkerSupported) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if push is supported
    if (!registration.pushManager) {
      console.warn('Push notifications not supported');
      return null;
    }
    
    // Get permission
    const permission = await window.Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }
    
    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // This public key should come from your server
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      )
    });
    
    // Return the subscription as a string to send to the server
    return JSON.stringify(subscription);
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Helper function to convert the application server key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Add to home screen component props
export interface AddToHomeScreenProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}