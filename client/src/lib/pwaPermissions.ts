/**
 * PWA Permission Management System
 * Handles all app permissions in one place to reduce user friction
 */

interface PWAPermissions {
  notifications: boolean;
  popups: boolean;
  storage: boolean;
  location: boolean;
  camera: boolean;
  microphone: boolean;
}

class PWAPermissionManager {
  private permissionsKey = 'pwa_permissions_granted';
  private permissionTimestamp = 'pwa_permissions_timestamp';

  // Check if user has already granted comprehensive permissions
  hasGrantedPermissions(): boolean {
    const granted = localStorage.getItem(this.permissionsKey) === 'true';
    const timestamp = localStorage.getItem(this.permissionTimestamp);
    
    // Check if permissions were granted within the last 30 days
    if (granted && timestamp) {
      const grantedTime = new Date(timestamp).getTime();
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      if (grantedTime > thirtyDaysAgo) {
        return true;
      } else {
        // Permissions expired, clear them
        this.clearPermissions();
        return false;
      }
    }
    
    return false;
  }

  // Grant all necessary permissions for smooth PWA experience
  async grantAllPermissions(): Promise<boolean> {
    try {
      console.log("Requesting comprehensive PWA permissions...");
      
      const permissions: Partial<PWAPermissions> = {};
      
      // Request notification permission if available
      if ('Notification' in window) {
        try {
          const notificationPermission = await Notification.requestPermission();
          permissions.notifications = notificationPermission === 'granted';
        } catch (error) {
          console.log("Notification permission not available:", error);
          permissions.notifications = false;
        }
      }

      // Request persistent storage
      if ('storage' in navigator && 'persist' in navigator.storage) {
        try {
          const storagePermission = await navigator.storage.persist();
          permissions.storage = storagePermission;
        } catch (error) {
          console.log("Storage persistence not available:", error);
          permissions.storage = false;
        }
      }

      // For popup blocking, we can't directly request permission,
      // but we can detect if popups are blocked and store user consent
      permissions.popups = true; // User consent granted by calling this function

      // Store the granted permissions
      localStorage.setItem(this.permissionsKey, 'true');
      localStorage.setItem(this.permissionTimestamp, new Date().toISOString());
      localStorage.setItem('pwa_permissions_details', JSON.stringify(permissions));

      // Also set session flag for immediate use
      sessionStorage.setItem('pwa_session_permissions', 'true');

      console.log("PWA permissions granted:", permissions);
      return true;

    } catch (error) {
      console.error("Error granting PWA permissions:", error);
      return false;
    }
  }

  // Clear all stored permissions (for logout or reset)
  clearPermissions(): void {
    localStorage.removeItem(this.permissionsKey);
    localStorage.removeItem(this.permissionTimestamp);
    localStorage.removeItem('pwa_permissions_details');
    sessionStorage.removeItem('pwa_session_permissions');
  }

  // Check if we need to show permission prompt
  shouldShowPermissionPrompt(): boolean {
    const hasPermissions = this.hasGrantedPermissions();
    const sessionPermissions = sessionStorage.getItem('pwa_session_permissions') === 'true';
    const dontShowAgain = localStorage.getItem('pwa_dont_show_prompt') === 'true';
    
    return !hasPermissions && !sessionPermissions && !dontShowAgain;
  }

  // Mark that user doesn't want to see permission prompt again
  dontShowPermissionPrompt(): void {
    localStorage.setItem('pwa_dont_show_prompt', 'true');
  }

  // Reset the "don't show again" preference
  resetPermissionPrompt(): void {
    localStorage.removeItem('pwa_dont_show_prompt');
  }

  // Get current permission status
  getPermissionStatus(): PWAPermissions {
    const defaultPermissions: PWAPermissions = {
      notifications: false,
      popups: false,
      storage: false,
      location: false,
      camera: false,
      microphone: false
    };

    const storedDetails = localStorage.getItem('pwa_permissions_details');
    if (storedDetails) {
      try {
        return { ...defaultPermissions, ...JSON.parse(storedDetails) };
      } catch (error) {
        console.error("Error parsing stored permissions:", error);
      }
    }

    return defaultPermissions;
  }
}

// Export singleton instance
export const pwaPermissionManager = new PWAPermissionManager();

// Hook for React components
export function usePWAPermissions() {
  const [hasPermissions, setHasPermissions] = React.useState(
    () => pwaPermissionManager.hasGrantedPermissions()
  );
  
  const [showPrompt, setShowPrompt] = React.useState(
    () => pwaPermissionManager.shouldShowPermissionPrompt()
  );

  const grantPermissions = async () => {
    const granted = await pwaPermissionManager.grantAllPermissions();
    if (granted) {
      setHasPermissions(true);
      setShowPrompt(false);
    }
    return granted;
  };

  const dontShowAgain = () => {
    pwaPermissionManager.dontShowPermissionPrompt();
    setShowPrompt(false);
  };

  const clearPermissions = () => {
    pwaPermissionManager.clearPermissions();
    setHasPermissions(false);
    setShowPrompt(true);
  };

  return {
    hasPermissions,
    showPrompt,
    grantPermissions,
    dontShowAgain,
    clearPermissions,
    permissionStatus: pwaPermissionManager.getPermissionStatus()
  };
}

// Add React import for the hook
import React from 'react';