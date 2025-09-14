/**
 * Custom Hooks for Grid V2 API - Clean State Management
 * 
 * These hooks provide clean, type-safe interfaces to the new Grid V2 API
 * with built-in validation, deduplication, and real-time updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Type definitions matching backend API
export interface Dot {
  id: number;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId?: number | null;
  chakraId?: number | null;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai';
  positionX?: number;
  positionY?: number;
  voiceData?: {
    summaryVoiceUrl?: string;
    anchorVoiceUrl?: string;
    pulseVoiceUrl?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Wheel {
  id: number;
  heading: string;
  goals: string;
  timeline: string;
  category?: string;
  color: string;
  chakraId?: number | null;
  sourceType: 'voice' | 'text';
  positionX?: number;
  positionY?: number;
  radius?: number;
  dots?: Dot[];
  voiceData?: {
    headingVoiceUrl?: string;
    goalsVoiceUrl?: string;
    timelineVoiceUrl?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chakra {
  id: number;
  heading: string;
  purpose: string;
  timeline: string;
  color: string;
  sourceType: 'voice' | 'text';
  positionX?: number;
  positionY?: number;
  radius?: number;
  wheels?: Wheel[];
  voiceData?: {
    headingVoiceUrl?: string;
    purposeVoiceUrl?: string;
    timelineVoiceUrl?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  filters?: Record<string, any>;
}

interface GridStats {
  totals: {
    dots: number;
    wheels: number;
    chakras: number;
  };
  mappings: {
    mappedDots: number;
    unmappedDots: number;
    mappedWheels: number;
    unmappedWheels: number;
  };
  percentages: {
    dotsMapped: number;
    wheelsMapped: number;
  };
}

// Fetch Hooks

/**
 * Hook to fetch user's dots with filtering options
 */
export function useDots(filters?: {
  wheelId?: number | 'null';
  chakraId?: number;
  unlinked?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery<ApiResponse<Dot[]>>({
    queryKey: ['/api/grid-v2/dots', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.wheelId !== undefined) params.set('wheelId', String(filters.wheelId));
      if (filters?.chakraId) params.set('chakraId', String(filters.chakraId));
      if (filters?.unlinked) params.set('unlinked', 'true');
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));
      
      const response = await fetch(`/api/grid-v2/dots?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dots: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch user's wheels with filtering options
 */
export function useWheels(filters?: {
  chakraId?: number | 'null';
  unlinked?: boolean;
  includeDots?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery<ApiResponse<Wheel[]>>({
    queryKey: ['/api/grid-v2/wheels', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.chakraId !== undefined) params.set('chakraId', String(filters.chakraId));
      if (filters?.unlinked) params.set('unlinked', 'true');
      if (filters?.includeDots) params.set('includeDots', 'true');
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));
      
      const response = await fetch(`/api/grid-v2/wheels?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wheels: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch user's chakras with filtering options
 */
export function useChakras(filters?: {
  includeWheels?: boolean;
  includeDots?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery<ApiResponse<Chakra[]>>({
    queryKey: ['/api/grid-v2/chakras', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.includeWheels) params.set('includeWheels', 'true');
      if (filters?.includeDots) params.set('includeDots', 'true');
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));
      
      const response = await fetch(`/api/grid-v2/chakras?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chakras: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch grid statistics
 */
export function useGridStats() {
  return useQuery<ApiResponse<GridStats>>({
    queryKey: ['/api/grid-v2/stats'],
    queryFn: async () => {
      const response = await fetch('/api/grid-v2/stats', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch grid stats: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
}

// Mapping Mutation Hooks

/**
 * Hook to map/unmap dots to wheels
 */
export function useMapDotToWheel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ dotId, wheelId }: { dotId: number; wheelId?: number }) => {
      const response = await fetch('/api/grid-v2/map/dot-to-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dotId, wheelId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to map dot to wheel');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/stats'] });
      
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook to map/unmap wheels to chakras
 */
export function useMapWheelToChakra() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ wheelId, chakraId }: { wheelId: number; chakraId?: number }) => {
      const response = await fetch('/api/grid-v2/map/wheel-to-chakra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ wheelId, chakraId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to map wheel to chakra');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/chakras'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/stats'] });
      
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook to map/unmap dots directly to chakras
 */
export function useMapDotToChakra() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ dotId, chakraId }: { dotId: number; chakraId?: number }) => {
      const response = await fetch('/api/grid-v2/map/dot-to-chakra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dotId, chakraId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to map dot to chakra');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/chakras'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/stats'] });
      
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Position Mutation Hooks

/**
 * Hook to save element position
 */
export function useSavePosition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      elementType,
      elementId,
      position,
      validateCollision = true
    }: {
      elementType: 'dot' | 'wheel' | 'chakra';
      elementId: number;
      position: { x: number; y: number };
      validateCollision?: boolean;
    }) => {
      const response = await fetch('/api/grid-v2/position/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ elementType, elementId, position, validateCollision })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save position');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate position-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/chakras'] });
    }
  });
}

/**
 * Hook to batch save multiple positions
 */
export function useBatchSavePositions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      positions,
      validateCollisions = true
    }: {
      positions: Array<{
        elementType: 'dot' | 'wheel' | 'chakra';
        elementId: number;
        position: { x: number; y: number };
      }>;
      validateCollisions?: boolean;
    }) => {
      const response = await fetch('/api/grid-v2/position/batch-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ positions, validateCollisions })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to batch save positions');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/chakras'] });
    }
  });
}

// Real-time Updates Hook

/**
 * Hook for Server-Sent Events real-time updates
 */
export function useGridRealTimeUpdates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource('/api/grid-v2/events', {
      withCredentials: true
    });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Grid V2 real-time updates connected');
    };

    eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE Connected:', data);
    });

    eventSource.addEventListener('dot-mapped', (event) => {
      const data = JSON.parse(event.data);
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/stats'] });
      
      toast({
        title: "Real-time Update",
        description: `Dot ${data.action} successfully`,
      });
    });

    eventSource.addEventListener('wheel-mapped', (event) => {
      const data = JSON.parse(event.data);
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/chakras'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/stats'] });
      
      toast({
        title: "Real-time Update",
        description: `Wheel ${data.action} successfully`,
      });
    });

    eventSource.addEventListener('dot-mapped-chakra', (event) => {
      const data = JSON.parse(event.data);
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/chakras'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/stats'] });
    });

    eventSource.addEventListener('position-updated', (event) => {
      const data = JSON.parse(event.data);
      // Update specific element position in cache without full refetch
      queryClient.setQueryData(['/api/grid-v2/dots'], (oldData: any) => {
        if (data.elementType === 'dot' && oldData?.data) {
          return {
            ...oldData,
            data: oldData.data.map((dot: Dot) => 
              dot.id === data.elementId 
                ? { ...dot, positionX: data.position.x, positionY: data.position.y }
                : dot
            )
          };
        }
        return oldData;
      });
    });

    eventSource.addEventListener('positions-batch-updated', (event) => {
      const data = JSON.parse(event.data);
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/dots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grid-v2/chakras'] });
    });

    eventSource.addEventListener('heartbeat', (event) => {
      // Keep connection alive
      console.log('SSE Heartbeat:', JSON.parse(event.data).timestamp);
    });

    eventSource.onerror = (event) => {
      setIsConnected(false);
      setConnectionError('Connection error occurred');
      console.error('Grid V2 SSE error:', event);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [queryClient, toast]);

  return {
    isConnected,
    connectionError,
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    }
  };
}

// Combined hook for comprehensive grid data
export function useGridData(includeRealTime = true) {
  const dots = useDots();
  const wheels = useWheels({ includeDots: false });
  const chakras = useChakras({ includeWheels: false });
  const stats = useGridStats();
  
  const realTimeUpdates = includeRealTime ? useGridRealTimeUpdates() : null;

  return {
    dots: dots.data?.data || [],
    wheels: wheels.data?.data || [],
    chakras: chakras.data?.data || [],
    stats: stats.data?.data,
    
    // Loading states
    isLoading: dots.isLoading || wheels.isLoading || chakras.isLoading,
    isError: dots.isError || wheels.isError || chakras.isError,
    
    // Error details
    errors: {
      dots: dots.error,
      wheels: wheels.error,
      chakras: chakras.error,
      stats: stats.error
    },

    // Real-time connection
    realTime: realTimeUpdates,
    
    // Refetch functions
    refetch: () => {
      dots.refetch();
      wheels.refetch();
      chakras.refetch();
      stats.refetch();
    }
  };
}