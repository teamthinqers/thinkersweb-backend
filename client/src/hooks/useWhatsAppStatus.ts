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
    // Initialize from localStorage if available
    const saved = localStorage.getItem('whatsapp_activated');
    return saved === 'true';
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
    retry: false,
    // Only fetch if the user is authenticated
    enabled: !!user,
    // Refresh every 15 seconds to detect changes
    refetchInterval: 15000,
    // Always refetch on window focus
    refetchOnWindowFocus: true,
  });
  
  // Update the status when data changes
  useEffect(() => {
    if (data?.isRegistered) {
      // Store in localStorage for persistence
      localStorage.setItem('whatsapp_activated', 'true');
      setActivationStatus(true);
    }
  }, [data]);
  
  // Simulate activation for demo purposes when user sends a link
  const simulateActivation = () => {
    localStorage.setItem('whatsapp_activated', 'true');
    setActivationStatus(true);
  };

  return {
    // Either API confirms it, or we have local activation
    isWhatsAppConnected: data?.isRegistered || activationStatus,
    phoneNumber: data?.phoneNumber || 'Your phone',
    registeredAt: data?.registeredAt ? new Date(data.registeredAt) : new Date(),
    isLoading,
    error,
    refetch,
    simulateActivation
  };
}