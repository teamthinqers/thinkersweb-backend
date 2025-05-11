import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

// Type for WhatsApp connection status
export interface WhatsAppStatusResponse {
  isRegistered: boolean;
  phoneNumber?: string;
  registeredAt?: string;
  userId?: number;
}

/**
 * Hook to check user's WhatsApp connection status
 */
export function useWhatsAppStatus() {
  const { user } = useAuth();
  
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
    // Refresh every 30 seconds to detect changes
    refetchInterval: 30000,
    // Always refetch on window focus
    refetchOnWindowFocus: true,
  });

  return {
    isWhatsAppConnected: data?.isRegistered || false,
    phoneNumber: data?.phoneNumber,
    registeredAt: data?.registeredAt ? new Date(data.registeredAt) : undefined,
    isLoading,
    error,
    refetch
  };
}