/**
 * Navigation Service
 * Centralized navigation control to fix persistent issues with Firebase auth and landing page navigation
 */

// Internal navigation state
const state = {
  intentionalHomeNavigation: false,
  lastNavigationTimestamp: 0,
  pendingRedirect: null as string | null,
};

// Navigation events to notify listeners
type NavigationEventType = 'homeIntended' | 'dashboardIntended' | 'authIntended' | 'navigationCompleted';
const listeners: Record<NavigationEventType, Array<() => void>> = {
  homeIntended: [],
  dashboardIntended: [],
  authIntended: [],
  navigationCompleted: [],
};

// Force navigation with full page reload to reset all state
export function navigateToHome(forcePersist = true): void {
  // Mark navigation as intentional in both memory and localStorage
  state.intentionalHomeNavigation = true;
  state.lastNavigationTimestamp = Date.now();
  
  if (forcePersist) {
    // Create timestamp with unique random value to ensure cache busting
    const timestamp = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('intentional_home_navigation', 'true');
    localStorage.setItem('navigation_timestamp', timestamp);
    
    // Notify listeners before navigation
    notifyListeners('homeIntended');
    
    // Force reload with cache busting to ensure clean state
    window.location.replace(`/?nocache=${timestamp}`);
  } else {
    // Only use soft navigation (for cases where we want to preserve state)
    notifyListeners('homeIntended');
    window.location.href = '/';
  }
}

// Navigate to dashboard with state reset if needed
export function navigateToDashboard(forceReload = false): void {
  state.intentionalHomeNavigation = false;
  localStorage.removeItem('intentional_home_navigation');
  
  notifyListeners('dashboardIntended');
  
  if (forceReload) {
    // Force reload for complete state reset
    window.location.replace(`/dashboard?t=${Date.now()}`);
  } else {
    // For normal dashboard navigation
    window.location.href = '/dashboard';
  }
}

// Navigate to auth page
export function navigateToAuth(): void {
  notifyListeners('authIntended');
  window.location.href = '/auth';
}

// Check if current navigation to home was intentional
export function isIntentionalHomeNavigation(): boolean {
  // Check state variables and localStorage
  const storedIntentional = localStorage.getItem('intentional_home_navigation') === 'true';
  const urlHasNocache = window.location.search.includes('nocache');
  
  return state.intentionalHomeNavigation || storedIntentional || urlHasNocache;
}

// Clear intentional navigation flags (after navigation is complete)
export function clearIntentionalNavigation(): void {
  state.intentionalHomeNavigation = false;
  localStorage.removeItem('intentional_home_navigation');
  localStorage.removeItem('navigation_timestamp');
  notifyListeners('navigationCompleted');
}

// Subscribe to navigation events
export function subscribeToNavigation(
  event: NavigationEventType,
  callback: () => void
): () => void {
  listeners[event].push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = listeners[event].indexOf(callback);
    if (index !== -1) {
      listeners[event].splice(index, 1);
    }
  };
}

// Notify all listeners of a navigation event
function notifyListeners(event: NavigationEventType): void {
  listeners[event].forEach(callback => callback());
}

// Initialize on load - check URL parameters for direct navigation
export function initNavigation(): void {
  // Check for nocache parameter which indicates force navigation to home
  if (window.location.search.includes('nocache')) {
    state.intentionalHomeNavigation = true;
    console.log('Navigation service detected intentional home navigation from URL parameters');
  }
  
  // Check localStorage for intentional navigation flag
  if (localStorage.getItem('intentional_home_navigation') === 'true') {
    state.intentionalHomeNavigation = true;
    console.log('Navigation service detected intentional home navigation from localStorage');
    
    // Clear the flag after a delay to allow the app to render properly
    setTimeout(() => {
      localStorage.removeItem('intentional_home_navigation');
    }, 3000);
  }
}

// Handle full page reloads more gracefully
window.addEventListener('beforeunload', () => {
  // Check if we're about to navigate away intentionally
  if (state.intentionalHomeNavigation) {
    localStorage.setItem('intentional_home_navigation', 'true');
  }
});

// Initialize on module load
initNavigation();