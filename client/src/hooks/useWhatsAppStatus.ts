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
  
  // Update the status when data changes or on component mount
  useEffect(() => {
    // If we get confirmation from the API
    if (data?.isRegistered) {
      // Store in localStorage for persistence
      localStorage.setItem('whatsapp_activated', 'true');
      setActivationStatus(true);
    } 
    
    // We also check localStorage on mount to ensure consistency
    const localActivation = localStorage.getItem('whatsapp_activated') === 'true';
    if (localActivation) {
      setActivationStatus(true);
    }
  }, [data]);
  
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
    }
  };
}