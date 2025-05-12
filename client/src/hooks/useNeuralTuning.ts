import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';
import { NeuralExtensionStatus } from './useNeuralExtension';

interface TuningParams {
  // Core processing parameters
  creativity?: number;  // 0.0 to 1.0 - affects response variety and uniqueness
  precision?: number;   // 0.0 to 1.0 - affects factual accuracy and detail level
  speed?: number;       // 0.0 to 1.0 - affects response time vs. depth tradeoff
  
  // Cognitive style parameters
  analytical?: number;  // 0.0 to 1.0 - logical/systematic thinking emphasis
  intuitive?: number;   // 0.0 to 1.0 - pattern recognition/insight emphasis
  
  // Specialty focus areas (weights for different domains)
  specialties?: {
    [domain: string]: number; // 0.0 to 1.0
  };
  
  // Active learning directives
  learningFocus?: string[];
}

export function useNeuralTuning() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mockStatus] = useState<NeuralExtensionStatus | null>(
    queryClient.getQueryData(['/api/neural-extension/status']) as NeuralExtensionStatus
  );
  
  // Mock available specialties for demo
  const [availableSpecialties] = useState([
    { id: 'tech', name: 'Technology & Computing' },
    { id: 'business', name: 'Business & Management' },
    { id: 'science', name: 'Science & Research' },
    { id: 'creative', name: 'Creative & Design' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'finance', name: 'Finance & Economics' },
    { id: 'education', name: 'Education & Learning' },
    { id: 'social', name: 'Social Sciences' }
  ]);
  
  // In a real implementation, this would fetch from the API
  const { data: status, isLoading, isError } = useQuery({
    queryKey: ['/api/neural-extension/status'],
    // For demo purposes, we're using the mock data
    queryFn: () => Promise.resolve(mockStatus)
  });
  
  // Update neural tuning parameters
  const updateTuningMutation = useMutation({
    mutationFn: async (params: TuningParams) => {
      // In a real implementation, this would call the API
      // return await apiRequest('POST', '/api/neural-extension/tuning', params);
      
      // For demo purposes, we'll just return a mock response
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
      
      // Create updated tuning params by merging with current settings
      const updatedTuning = {
        ...status?.tuning,
        ...params,
        specialties: {
          ...status?.tuning.specialties,
          ...(params.specialties || {})
        }
      };
      
      // Create an updated status object with the new tuning params
      const updatedStatus = {
        ...status,
        tuning: updatedTuning
      };
      
      return updatedStatus;
    },
    onSuccess: (data) => {
      // Update the cached status data
      queryClient.setQueryData(['/api/neural-extension/status'], data);
      
      toast({
        title: "Neural Extension Updated",
        description: "Your neural extension tuning parameters have been updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating neural tuning:', error);
      
      toast({
        title: "Update Failed",
        description: "Failed to update neural extension parameters. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Function to update learning focus
  const updateLearningFocusMutation = useMutation({
    mutationFn: async (focusAreas: string[]) => {
      // In a real implementation, this would call the API
      // return await apiRequest('POST', '/api/neural-extension/learning-focus', { focusAreas });
      
      // For demo purposes, we'll just return a mock response
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
      
      // Create an updated status with the new learning focus
      const updatedStatus = {
        ...status,
        tuning: {
          ...status?.tuning,
          learningFocus: focusAreas
        }
      };
      
      return updatedStatus;
    },
    onSuccess: (data) => {
      // Update the cached status data
      queryClient.setQueryData(['/api/neural-extension/status'], data);
      
      toast({
        title: "Learning Focus Updated",
        description: "Your neural extension learning directives have been updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating learning focus:', error);
      
      toast({
        title: "Update Failed",
        description: "Failed to update learning focus. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return {
    status,
    isLoading,
    isError,
    availableSpecialties,
    updateTuning: updateTuningMutation.mutate,
    isUpdating: updateTuningMutation.isPending,
    updateLearningFocus: updateLearningFocusMutation.mutate,
    isUpdatingFocus: updateLearningFocusMutation.isPending
  };
}