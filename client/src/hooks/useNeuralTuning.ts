import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useNeuralExtension } from './useNeuralExtension';
import { useToast } from './use-toast';

// Neural tuning interface from the server
export interface NeuralTuning {
  // Core processing parameters
  creativity: number; // 0.0 to 1.0 - affects response variety and uniqueness
  precision: number;  // 0.0 to 1.0 - affects factual accuracy and detail level
  speed: number;      // 0.0 to 1.0 - affects response time vs. depth tradeoff
  
  // Cognitive style parameters
  analytical: number; // 0.0 to 1.0 - logical/systematic thinking emphasis
  intuitive: number;  // 0.0 to 1.0 - pattern recognition/insight emphasis
  
  // Specialty focus areas (weights for different domains)
  specialties: {
    [domain: string]: number; // 0.0 to 1.0 - e.g., "science", "business", "creative"
  };
  
  // Active learning directives - what the extension should prioritize learning
  learningFocus: string[];
}

// Neural game elements interface
export interface NeuralGameElements {
  level: number;
  experience: number;
  experienceRequired: number;
  unlockedCapabilities: string[];
  achievements: {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress: number;
  }[];
  stats: {
    messagesProcessed: number;
    insightsGenerated: number;
    connectionsFormed: number;
    adaptationScore: number;
  };
}

/**
 * Hook for managing neural tuning parameters
 * This allows users to customize how their neural extension processes information
 */
export function useNeuralTuning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { status, refresh } = useNeuralExtension();
  
  // Get the current tuning parameters and game elements from the neural extension status
  const tuning = status?.tuning;
  const gameElements = status?.gameElements;
  
  // Mutation to update neural tuning parameters
  const updateTuningMutation = useMutation({
    mutationFn: async (newTuning: Partial<NeuralTuning>) => {
      const res = await apiRequest('POST', '/api/neural-extension/tune', newTuning);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Neural Extension Updated',
        description: 'Your neural extension has been tuned to your preferences.',
        variant: 'default',
      });
      // Refresh neural extension data
      refresh();
    },
    onError: (error: Error) => {
      toast({
        title: 'Tuning Failed',
        description: `Could not update neural parameters: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to update specialty focus
  const updateSpecialtyMutation = useMutation({
    mutationFn: async ({ domain, value }: { domain: string; value: number }) => {
      const specialties = { ...tuning?.specialties, [domain]: value };
      const res = await apiRequest('POST', '/api/neural-extension/tune', { 
        specialties 
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Specialty Focus Updated',
        description: 'Your neural extension specialty focus has been updated.',
        variant: 'default',
      });
      // Refresh neural extension data
      refresh();
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: `Could not update specialty focus: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to update learning focus
  const updateLearningFocusMutation = useMutation({
    mutationFn: async (learningFocus: string[]) => {
      const res = await apiRequest('POST', '/api/neural-extension/tune', { 
        learningFocus 
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Learning Focus Updated',
        description: 'Your neural extension learning priorities have been updated.',
        variant: 'default',
      });
      // Refresh neural extension data
      refresh();
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: `Could not update learning focus: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Format a tuning value for display (0.0-1.0 to 0-100%)
  const formatTuningValue = (value?: number): string => {
    if (value === undefined) return '50%';
    return `${Math.round(value * 100)}%`;
  };
  
  // Calculate progress to next level
  const calculateLevelProgress = (): number => {
    if (!gameElements) return 0;
    return gameElements.experience / gameElements.experienceRequired;
  };
  
  return {
    tuning,
    gameElements,
    isLoading: !tuning,
    updateTuning: (params: Partial<NeuralTuning>) => updateTuningMutation.mutate(params),
    updateSpecialty: (domain: string, value: number) => 
      updateSpecialtyMutation.mutate({ domain, value }),
    updateLearningFocus: (focus: string[]) => updateLearningFocusMutation.mutate(focus),
    formatTuningValue,
    calculateLevelProgress,
    isPending: updateTuningMutation.isPending || 
              updateSpecialtyMutation.isPending || 
              updateLearningFocusMutation.isPending
  };
}