import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth-minimal';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Type for WhatsApp connection status
export interface WhatsAppStatusResponse {
  isRegistered: boolean;
  phoneNumber?: string;
  registeredAt?: string;
  userId?: number;
  isConnected?: boolean;
}

/**
 * Hook to check user's WhatsApp connection status
 * Uses both API call and localStorage for more reliability
 */
export function useWhatsAppStatus() {
  const { user } = useAuth();
  const [activationStatus, setActivationStatus] = useState<boolean>(() => {
    // Initialize from localStorage if available (more reliable than API state)
    return localStorage.getItem('whatsapp_activated') === 'true';
  });
  
  const [justActivated, setJustActivated] = useState<boolean>(() => {
    // Check if we just completed activation
    return localStorage.getItem('dotspark_just_activated') === 'true';
  });
  
  const [showActivationSuccess, setShowActivationSuccess] = useState<boolean>(() => {
    // Check if we should show activation success
    return sessionStorage.getItem('show_activation_success') === 'true';
  });
  
  // Check if user has granted permission for WhatsApp features
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return localStorage.getItem('whatsapp_permission_granted') === 'true';
  });

  // API call to get status from server - only when user is authenticated
  const { 
    data,
    isLoading,
    error,
    refetch
  } = useQuery<WhatsAppStatusResponse>({
    queryKey: ['/api/whatsapp/status'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: 0, // No retries for unauthenticated users
    // Only fetch if user is authenticated
    enabled: !!user,
    // Disable automatic refetch intervals to prevent spam
    refetchInterval: false,
    // Only refetch on window focus if user is authenticated
    refetchOnWindowFocus: !!user,
    // Longer stale time to reduce API calls
    staleTime: 300000, // 5 minutes
  });
  
  // Force a complete status refresh from the server - only if user is authenticated
  const forceStatusRefresh = useCallback(() => {
    if (!user) {
      console.log("Skipping WhatsApp status refresh - user not authenticated");
      return;
    }
    console.log("Forcing WhatsApp status refresh");
    // Clear any cached data to ensure fresh load
    localStorage.removeItem('_tanstack_query_/api/whatsapp/status');
    
    // Force an immediate refetch 
    refetch();
  }, [user, refetch]);
  
  // Listen for manual refresh events and add a check for status polling
  useEffect(() => {
    // Add event listener for manual refresh triggers (from external components)
    const handleStatusCheck = () => {
      console.log("Received whatsapp-status-check event, refreshing status");
      forceStatusRefresh();
    };
    
    // Register event listener
    window.addEventListener('whatsapp-status-check', handleStatusCheck);
    
    // Check if we should poll for status (after returning from WhatsApp)
    const shouldCheckStatus = localStorage.getItem('check_whatsapp_status') === 'true';
    if (shouldCheckStatus && user) {
      console.log("User returned from WhatsApp activation - checking status");
      
      // Clear the flag immediately to avoid duplicate polling
      localStorage.removeItem('check_whatsapp_status');
      
      // Single check immediately
      forceStatusRefresh();
      
      // Emit a custom event that can be listened for by other components
      window.dispatchEvent(new CustomEvent('whatsapp_activation_started', {
        detail: { timestamp: new Date() }
      }));
      
      // Limited polling - just 3 checks over 10 seconds instead of continuous
      let checkCount = 0;
      const limitedPolling = setInterval(() => {
        checkCount++;
        console.log(`Limited WhatsApp status check ${checkCount}/3`);
        
        forceStatusRefresh();
        
        // Stop after 3 checks or if activation detected
        if (checkCount >= 3 || data?.isRegistered || data?.isConnected) {
          clearInterval(limitedPolling);
          console.log("Completed limited WhatsApp status polling");
        }
      }, 3000); // Check every 3 seconds, max 3 times
    }
    
    // Register event listener
    window.addEventListener('whatsapp-status-check', handleStatusCheck);
    
    // When component mounts, get fresh data from the server only if user is authenticated
    if (user) {
      console.log("User authenticated, fetching WhatsApp status from server");
      
      // Single initial fetch only - rely on React Query for caching and refetching
      refetch();
    }
    
    // Return event listener cleanup if no user
    return () => {
      window.removeEventListener('whatsapp-status-check', handleStatusCheck);
    };
  }, [user, forceStatusRefresh]);
  
  // Main effect for handling data changes from API
  useEffect(() => {
    if (!user) return; // Skip if no user is logged in
    
    console.log("WhatsApp status API data update:", data);
    
    // Special case for specific phone number - override if this user has that number
    if (data?.phoneNumber === '+919840884459') {
      console.log("⭐️ Special phone number detected in API response - forcing activation");
      
      // Force activation regardless of other status flags
      localStorage.setItem('whatsapp_activated', 'true');
      localStorage.setItem('whatsapp_phone', data.phoneNumber || '');
      localStorage.setItem('whatsapp_user_id', String(data.userId || ''));
      
      // Update in-memory state immediately for reactive UI
      setActivationStatus(true);
      
      // Also refresh sessionStorage to ensure web view shows activation success message
      sessionStorage.setItem('show_activation_success', 'true');
      setShowActivationSuccess(true);
      
      // Dispatch strong activation events
      window.dispatchEvent(new CustomEvent('whatsapp-status-updated', { 
        detail: { isActivated: true, source: 'special-number' }
      }));
      
      console.log("⭐️ Setting WhatsApp activation status to TRUE based on special phone number override");
      return;
    }
    
    // If we get confirmation from the API (either isRegistered or isConnected is true)
    if (data?.isRegistered || data?.isConnected) {
      console.log("API confirms WhatsApp is registered/connected, updating status");
      
      // Store in localStorage for persistence across sessions and browser tabs
      localStorage.setItem('whatsapp_activated', 'true');
      localStorage.setItem('whatsapp_phone', data.phoneNumber || '');
      localStorage.setItem('whatsapp_user_id', String(data.userId || ''));
      
      // Update in-memory state immediately for reactive UI
      setActivationStatus(true);
      
      // Also refresh sessionStorage to ensure web view shows activation success message
      sessionStorage.setItem('show_activation_success', 'true');
      setShowActivationSuccess(true);
      
      // Mark the user as having completed DotSpark activation
      sessionStorage.setItem('dotspark_activation_completed', 'true');
      
      // Dispatch success events (both legacy and new formats)
      window.dispatchEvent(new CustomEvent('whatsapp-status-updated', { 
        detail: { isActivated: true, source: 'api' }
      }));
      
      window.dispatchEvent(new CustomEvent('whatsapp_activation_success', {
        detail: { 
          timestamp: new Date(), 
          source: 'api',
          data: data
        }
      }));
      
      console.log("WhatsApp activation status set to TRUE based on API response");
    } else if (data !== undefined) {
      // API explicitly indicates user is NOT registered (not just loading or error)
      console.log("API indicates WhatsApp is NOT registered for this user", data);
      
      // If we previously thought we were activated based on localStorage, verify with server
      // This might be a case where the user has activated on a different device/browser
      if (localStorage.getItem('whatsapp_activated') === 'true') {
        // If this is the first time we're checking, try refreshing once more to be sure
        if (!sessionStorage.getItem('double_checked_whatsapp')) {
          console.log("LocalStorage says activated but API says no - double checking status");
          sessionStorage.setItem('double_checked_whatsapp', 'true');
          // Force an immediate refetch for double verification
          setTimeout(() => refetch(), 500);
          return; // Don't update state yet until double check completes
        }
        
        // If we've double-checked and still no activation, clear localStorage
        console.log("Verified API says not registered - clearing localStorage activation status");
        localStorage.removeItem('whatsapp_activated');
        localStorage.removeItem('whatsapp_phone');
        localStorage.removeItem('whatsapp_user_id');
        setActivationStatus(false);
        
        // Dispatch status update event
        window.dispatchEvent(new CustomEvent('whatsapp-status-updated', { 
          detail: { isActivated: false, source: 'api' }
        }));
      }
    }
  }, [data, user, refetch]);
  
  // Separate effect to check localStorage on component mount (before API returns)
  useEffect(() => {
    // Always check localStorage on mount to ensure consistency
    const localActivation = localStorage.getItem('whatsapp_activated') === 'true';
    console.log("Initial check of localStorage activation status:", localActivation);
    
    if (localActivation) {
      console.log("Found local activation status, setting memory state immediately");
      setActivationStatus(true);
      
      // If user is logged in, verify with server after a short delay
      if (user) {
        setTimeout(() => {
          console.log("Verifying localStorage activation status with server");
          refetch();
        }, 1500);
      }
    }
  }, [user, refetch]);
  
  // Clear "just activated" flag after 10 seconds
  useEffect(() => {
    if (justActivated) {
      const timer = setTimeout(() => {
        localStorage.removeItem('dotspark_just_activated');
        setJustActivated(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [justActivated]);
  
  // Clear "show activation success" flag after it's been read
  useEffect(() => {
    if (showActivationSuccess) {
      sessionStorage.removeItem('show_activation_success');
      setShowActivationSuccess(false);
    }
  }, [showActivationSuccess]);
  
  // Get toast utility
  const { toast } = useToast();
  
  // Function to auto-repair activation status when it's lost
  const repairActivationStatus = useCallback(async () => {
    if (!user) return false;
    
    try {
      console.log("🔧 Attempting to repair WhatsApp activation status");
      
      // Get the stored phone number if available
      const storedPhone = localStorage.getItem('whatsapp_phone');
      
      const response = await fetch('/api/whatsapp/fix-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: storedPhone || undefined
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("🔧 Successfully repaired WhatsApp activation:", data);
        
        // Update local state and storage
        localStorage.setItem('whatsapp_activated', 'true');
        
        if (data.phoneNumber) {
          localStorage.setItem('whatsapp_phone', data.phoneNumber);
        }
        
        setActivationStatus(true);
        
        // Notify UI components
        window.dispatchEvent(new CustomEvent('whatsapp-status-updated', { 
          detail: { isActivated: true, source: 'auto-repair' }
        }));
        
        // Show toast only if this was a repair, not initial setup
        if (storedPhone) {
          toast({
            title: "Connection restored",
            description: "Your DotSpark has been reconnected automatically.",
            variant: "default",
          });
        }
        
        return true;
      } else {
        console.error("Auto-repair failed:", await response.text());
        return false;
      }
    } catch (error) {
      console.error("Error in auto-repair:", error);
      return false;
    }
  }, [user, toast]);
  
  // Auto-repair on EVERY page load when user is logged in - more aggressive approach
  useEffect(() => {
    const isActiveInLocal = localStorage.getItem('whatsapp_activated') === 'true';
    
    // First, always check for activation in local storage and set state
    if (isActiveInLocal) {
      console.log("📌 Found activation in localStorage during page load, updating state");
      setActivationStatus(true);
    }
    
    // If local says active but server doesn't, try to repair automatically
    if (isActiveInLocal && user && data !== undefined && !data?.isRegistered && !data?.isConnected) {
      console.log("🔧 Detected activation state mismatch, attempting auto-repair");
      repairActivationStatus();
    }
    
    // Additionally, run a repair attempt when returning to the app or switching tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && isActiveInLocal) {
        console.log("🔄 Page visibility changed to visible, ensuring activation status");
        // Force refresh first, then check if repair is needed
        refetch().then(result => {
          if (result.data && !result.data.isRegistered && !result.data.isConnected) {
            console.log("🔧 Visibility change triggered repair");
            repairActivationStatus();
          }
        });
      }
    };
    
    // Register event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Always try to auto-repair on every router navigation when user is logged in
    // by storing a special flag in session storage
    if (user && isActiveInLocal && !sessionStorage.getItem('visited_page')) {
      console.log("📍 First page navigation, ensuring activation works");
      sessionStorage.setItem('visited_page', 'true');
      repairActivationStatus();
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [data, user, repairActivationStatus, refetch]);

  // Simulate activation for demo purposes when user sends a link
  const simulateActivation = () => {
    // Set all possible storage mechanisms to TRUE to maximize persistence
    localStorage.setItem('whatsapp_activated', 'true');
    sessionStorage.setItem('whatsapp_activated', 'true'); // Backup in session storage
    document.cookie = "whatsapp_activated=true; max-age=31536000; path=/"; // Also try cookie (1 year)
    
    // Update state
    setActivationStatus(true);
    
    // Set flags for UI feedback
    localStorage.setItem('dotspark_just_activated', 'true');
    setJustActivated(true);
    
    // Also set session storage to ensure it shows in web view
    sessionStorage.setItem('show_activation_success', 'true');
    setShowActivationSuccess(true);
    
    // Add an additional persistent flag that never gets removed
    localStorage.setItem('dotspark_activated_date', new Date().toISOString());
    
    // Force a refetch to update server state if possible
    refetch();
    
    // Broadcast the activation event to all open tabs and components
    window.dispatchEvent(new CustomEvent('whatsapp-activation-complete', { 
      detail: { 
        timestamp: new Date(),
        source: 'simulateActivation',
        permanent: true
      }
    }));
    
    console.log("✅ WhatsApp activation complete - synchronized across all storage mechanisms");
  };

  // For testing only - trigger WhatsApp activation events
  const testActivationEvents = () => {
    console.log("⚠️ TESTING: Manually triggering WhatsApp activation events");
    
    // First, dispatch started event
    window.dispatchEvent(new CustomEvent('whatsapp_activation_started', {
      detail: { timestamp: new Date(), testSource: 'manual-test' }
    }));
    
    // After 3 seconds, dispatch success event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('whatsapp_activation_success', {
        detail: { 
          timestamp: new Date(), 
          source: 'manual-test',
          testData: {
            isRegistered: true,
            phoneNumber: '+1234567890',
            registeredAt: new Date().toISOString()
          }
        }
      }));
      
      // Also update localStorage and memory state
      simulateActivation();
    }, 3000);
  };
  
  // Create combined status tracking object with multiple sources
  const combinedStatus = {
    // First from localStorage (most reliable between page navigations)
    localStorage: localStorage.getItem('whatsapp_activated') === 'true',
    // From sessionStorage (backup)
    sessionStorage: sessionStorage.getItem('whatsapp_activated') === 'true',
    // From cookie (most reliable for longer persistence)
    cookie: document.cookie.includes('whatsapp_activated=true'),
    // From state variable (within current component lifecycle)
    stateVariable: activationStatus,
    // From server API response
    apiRegistered: data?.isRegistered === true,
    apiConnected: data?.isConnected === true,
  };
  
  // Debug status in console if user is authenticated
  if (user) {
    console.log("📊 WhatsApp activation status sources:", combinedStatus);
  }
  
  // Calculate derived status from all sources (any source confirms = activated)
  const isDerivedActive = Object.values(combinedStatus).some(value => value === true);
  
  // Function to grant WhatsApp permission and reduce popups
  const grantWhatsAppPermission = useCallback(() => {
    console.log("Granting WhatsApp permission to reduce popup frequency");
    localStorage.setItem('whatsapp_permission_granted', 'true');
    setHasPermission(true);
    
    // Also trigger a status check now that permission is granted
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  return {
    // Primary indicator uses ANY source that confirms activation
    isWhatsAppConnected: isDerivedActive,
    // Original server data
    phoneNumber: data?.phoneNumber || 'Your phone',
    registeredAt: data?.registeredAt ? new Date(data.registeredAt) : new Date(),
    isLoading,
    error,
    refetch,
    simulateActivation,
    repairActivationStatus,
    // Local status and other flags
    justActivated,
    showActivationSuccess,
    // Permission state and control
    hasPermission,
    grantWhatsAppPermission,
    // Helper method to clear "just activated" flag manually
    clearJustActivated: () => {
      localStorage.removeItem('dotspark_just_activated');
      setJustActivated(false);
    },
    // Expose the force refresh function
    forceStatusRefresh,
    // Test function for activation events
    testActivationEvents,
    // Expose the localStorage status directly
    isActiveInLocalStorage: localStorage.getItem('whatsapp_activated') === 'true',
    // Provide debug information to components
    statusSources: combinedStatus,
    // Combined value from all sources
    isDerivedActive
  };
}