import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Interface for neural extension status
interface NeuralExtensionStatus {
  isActive: boolean;
  topicsTracked: number;
  patternsDetected: number;
  insightsGenerated: number;
  adaptationLevel: number;
}

// Interface for neural insights
interface NeuralInsight {
  insight: string;
  confidence: number;
  topics: string[];
  generatedAt: string;
}

// Hook for accessing neural extension functionality
export function useNeuralExtension() {
  const { toast } = useToast();
  
  // Query to get neural extension status
  const statusQuery = useQuery<NeuralExtensionStatus>({
    queryKey: ['/api/neural-extension/status'],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: 1,
    staleTime: 60000, // 1 minute
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to get neural extension status: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Query to get neural insights
  const insightsQuery = useQuery<{ insights: NeuralInsight[] }>({
    queryKey: ['/api/neural-extension/insights'],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: 1,
    staleTime: 300000, // 5 minutes
    enabled: !!statusQuery.data?.isActive,
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to get neural insights: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Query to get topic recommendations
  const recommendationsQuery = useQuery<{ topics: string[] }>({
    queryKey: ['/api/neural-extension/recommendations'],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: 1,
    staleTime: 300000, // 5 minutes
    enabled: !!statusQuery.data?.isActive,
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to get topic recommendations: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Function to refresh neural data
  const refreshNeuralData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/neural-extension/status'] });
    queryClient.invalidateQueries({ queryKey: ['/api/neural-extension/insights'] });
    queryClient.invalidateQueries({ queryKey: ['/api/neural-extension/recommendations'] });
  };
  
  // Format adaptation level as a readable string (e.g., "27%")
  const formatAdaptationLevel = (level?: number): string => {
    if (level === undefined) return 'Not calculated';
    return `${Math.round(level * 100)}%`;
  };

  return {
    status: statusQuery.data,
    insights: insightsQuery.data?.insights || [],
    recommendations: recommendationsQuery.data?.topics || [],
    isLoading: statusQuery.isLoading || insightsQuery.isLoading || recommendationsQuery.isLoading,
    isError: statusQuery.isError || insightsQuery.isError || recommendationsQuery.isError,
    error: statusQuery.error || insightsQuery.error || recommendationsQuery.error,
    refresh: refreshNeuralData,
    formatAdaptationLevel,
  };
}