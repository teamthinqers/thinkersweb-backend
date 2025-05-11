import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

// Type for WhatsApp connection status
export interface WhatsAppStatusResponse {
  isRegistered: boolean;
  phoneNumber?: string;
  registeredAt?: string;
  userId?: number;
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
    return localStorage.getItem('neural_just_activated') === 'true';
  });
  
  const [showActivationSuccess, setShowActivationSuccess] = useState<boolean>(() => {
    // Check if we should show activation success
    return sessionStorage.getItem('show_activation_success') === 'true';
  });
  
  // API call to get status from server
  const { 
    data,
    isLoading,
    error,
    refetch
  } = useQuery<WhatsAppStatusResponse>({
    queryKey: ['/api/whatsapp/status'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: 2, // Add retries to improve reliability
    // Only fetch if the user is authenticated
    enabled: !!user,
    // Refresh every 10 seconds to detect changes more quickly
    refetchInterval: 10000,
    // Always refetch on window focus
    refetchOnWindowFocus: true,
    // After 30 seconds of inactivity, refetch on window focus
    staleTime: 30000,
  });
  
  // Force a complete status refresh from the server - useful for synchronizing web/mobile views
  const forceStatusRefresh = () => {
    console.log("Forcing WhatsApp status refresh");
    // Clear any cached data to ensure fresh load
    localStorage.removeItem('_tanstack_query_/api/whatsapp/status');
    
    // Force an immediate refetch 
    refetch();
  };
  
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
      console.log("Starting WhatsApp status polling after redirect");
      
      // Clear the flag immediately to avoid duplicate polling
      localStorage.removeItem('check_whatsapp_status');
      
      // Set up a polling interval for frequent checks - more aggressive for better responsiveness
      const fastPollingInterval = setInterval(() => {
        console.log("Fast polling WhatsApp status...");
        forceStatusRefresh();
      }, 1000); // Poll every 1 second initially
      
      // After 10 seconds, switch to slower polling
      setTimeout(() => {
        clearInterval(fastPollingInterval);
        console.log("Switching to slower WhatsApp status polling");
        
        // Continue with less frequent polling
        const slowPollingInterval = setInterval(() => {
          console.log("Slow polling WhatsApp status...");
          forceStatusRefresh();
        }, 3000); // Poll every 3 seconds
        
        // Stop all polling after another 20 seconds
        setTimeout(() => {
          clearInterval(slowPollingInterval);
          console.log("Stopping WhatsApp status polling");
        }, 20000);
      }, 10000);
    }
    
    // When component mounts, ensure we get fresh data from the server
    if (user) {
      console.log("User authenticated, forcing refresh of WhatsApp status from server");
      forceStatusRefresh();
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('whatsapp-status-check', handleStatusCheck);
    };
  }, [user, forceStatusRefresh]);
  
  // Main effect for handling data changes from API
  useEffect(() => {
    if (!user) return; // Skip if no user is logged in
    
    console.log("WhatsApp status API data update:", data);
    
    // If we get confirmation from the API
    if (data?.isRegistered) {
      console.log("API confirms WhatsApp is registered, updating status");
      // Store in localStorage for persistence across sessions and browser tabs
      localStorage.setItem('whatsapp_activated', 'true');
      localStorage.setItem('whatsapp_phone', data.phoneNumber || '');
      localStorage.setItem('whatsapp_user_id', String(data.userId || ''));
      
      // Update in-memory state
      setActivationStatus(true);
      
      // Also refresh sessionStorage to ensure web view sees activation success message
      sessionStorage.setItem('show_activation_success', 'true');
      setShowActivationSuccess(true);
      
      console.log("WhatsApp activation status set to TRUE based on API response");
    } else if (data !== undefined) {
      // API explicitly indicates user is NOT registered (not just loading or error)
      console.log("API indicates WhatsApp is NOT registered for this user");
      
      // If we previously thought we were activated, but API says no, clear localStorage
      if (localStorage.getItem('whatsapp_activated') === 'true') {
        console.log("Clearing incorrect localStorage activation status");
        localStorage.removeItem('whatsapp_activated');
        localStorage.removeItem('whatsapp_phone');
        localStorage.removeItem('whatsapp_user_id');
        setActivationStatus(false);
      }
    }
  }, [data, user]);
  
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
        localStorage.removeItem('neural_just_activated');
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
  
  // Simulate activation for demo purposes when user sends a link
  const simulateActivation = () => {
    localStorage.setItem('whatsapp_activated', 'true');
    setActivationStatus(true);
    
    // Set flags for UI feedback
    localStorage.setItem('neural_just_activated', 'true');
    setJustActivated(true);
    
    // Also set session storage to ensure it shows in web view
    sessionStorage.setItem('show_activation_success', 'true');
    setShowActivationSuccess(true);
    
    // Force a refetch to update server state if possible
    refetch();
  };

  return {
    // Either API confirms it, or we have local activation
    isWhatsAppConnected: data?.isRegistered || activationStatus,
    phoneNumber: data?.phoneNumber || 'Your phone',
    registeredAt: data?.registeredAt ? new Date(data.registeredAt) : new Date(),
    isLoading,
    error,
    refetch,
    simulateActivation,
    // Add the new state flags
    justActivated,
    showActivationSuccess,
    // Helper method to clear "just activated" flag manually
    clearJustActivated: () => {
      localStorage.removeItem('neural_just_activated');
      setJustActivated(false);
    },
    // Expose the force refresh function
    forceStatusRefresh
  };
}