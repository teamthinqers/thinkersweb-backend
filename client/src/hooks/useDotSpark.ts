import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { getQueryFn } from '@/lib/queryClient';

// Define types for DotSpark status
export interface DotSparkInsight {
  insight: string;
  confidence: number;
  topics: string[];
  generatedAt: Date;
}

export interface DotSparkStatus {
  isActive: boolean;
  gameElements: {
    level: number;
    experience: number;
    experienceRequired: number;
    unlockedCapabilities: string[];
    achievements: {
      id: string;
      name: string;
      description: string;
      unlocked: boolean;
      unlockedAt?: Date;
      progress: number;
    }[];
    stats: {
      messagesProcessed: number;
      insightsGenerated: number;
      connectionsFormed: number;
      adaptationScore: number;
    };
  };
  tuning: {
    // Core processing parameters
    creativity: number;
    precision: number;
    speed: number;
    adaptability: number;
    cognitivePace: number;
    signalFocus: number;
    
    // Cognitive style parameters
    analytical: number;
    intuitive: number;
    
    // Memory parameters
    memoryRetention: number;
    memoryRecall: number;
    connectionStrength: number;
    patternRecognition: number;
    
    // Learning parameters
    learningRate: number;
    conceptIntegration: number;
    curiosityIndex: number;
    
    // Specialty focus areas and learning directives
    specialties: Record<string, number>;
    learningFocus: string[];
  };
  topicsTracked: string[];
  adaptationLevel: number;
  patternsDetected: {
    pattern: string;
    examples: string[];
    frequency: number;
    lastDetected: string;
  }[];
}

export function useDotSpark() {
  const { toast } = useToast();
  const [mockData] = useState<DotSparkStatus>({
    isActive: true,
    gameElements: {
      level: 3,
      experience: 560,
      experienceRequired: 1000,
      unlockedCapabilities: ['Pattern Recognition', 'Topic Analysis', 'Auto-Summarization'],
      achievements: [
        {
          id: 'first-insight',
          name: 'First Insight',
          description: 'Generate your first neural insight',
          unlocked: true,
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          progress: 1.0
        },
        {
          id: 'connection-maker',
          name: 'Connection Maker',
          description: 'Connect 10 related concepts',
          unlocked: false,
          progress: 0.6
        }
      ],
      stats: {
        messagesProcessed: 47,
        insightsGenerated: 12,
        connectionsFormed: 24,
        adaptationScore: 68
      }
    },
    tuning: {
      creativity: 0.7,
      precision: 0.8,
      speed: 0.5,
      adaptability: 0.65,
      cognitivePace: 0.5,
      analytical: 0.8,
      intuitive: 0.6,
      memoryRetention: 0.75,
      memoryRecall: 0.7,
      connectionStrength: 0.65,
      patternRecognition: 0.8,
      learningRate: 0.6,
      conceptIntegration: 0.7,
      curiosityIndex: 0.85,
      specialties: {
        'tech': 0.9,
        'business': 0.7,
        'science': 0.4
      },
      learningFocus: ['Machine Learning', 'Project Management', 'Data Analysis']
    },
    topicsTracked: ['Artificial Intelligence', 'Project Management', 'Leadership', 'Data Science'],
    adaptationLevel: 68,
    patternsDetected: [
      {
        pattern: 'Problem-Solution Framework',
        examples: [
          'When facing X, try Y approach',
          'X challenge can be solved with Y technique'
        ],
        frequency: 0.3,
        lastDetected: new Date().toISOString()
      }
    ]
  });
  
  // In a real implementation, this would fetch from the API
  const { data: status, isLoading, isError } = useQuery({
    queryKey: ['/api/dotspark/status'],
    // For demo purposes, we're using the mock data
    // In production, use: queryFn: getQueryFn({ on401: "returnNull" })
    queryFn: () => Promise.resolve(mockData)
  });
  
  // Mock functions for insights and topics
  const { data: insightsData } = useQuery({
    queryKey: ['/api/dotspark/insights'],
    queryFn: () => Promise.resolve({ 
      insights: [
        {
          insight: "You seem to focus on technical solutions before defining business requirements",
          confidence: 0.87,
          topics: ["Project Management", "Software Development"],
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          insight: "Your leadership entries frequently mention communication challenges",
          confidence: 0.79,
          topics: ["Leadership", "Communication"],
          generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          insight: "You're developing a pattern of documenting solutions for future reference",
          confidence: 0.92,
          topics: ["Knowledge Management", "Productivity"],
          generatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        }
      ] 
    }),
    enabled: status?.isActive === true
  });
  
  const { data: topicsData } = useQuery({
    queryKey: ['/api/dotspark/topics/recommended'],
    queryFn: () => Promise.resolve({ 
      topics: [
        "System Architecture",
        "Team Dynamics",
        "Continuous Integration",
        "User Experience",
        "Technical Debt"
      ] 
    }),
    enabled: status?.isActive === true
  });
  
  useEffect(() => {
    if (isError) {
      toast({
        title: "DotSpark Error",
        description: "Unable to connect to your DotSpark. Please try again later.",
        variant: "destructive"
      });
    }
  }, [isError, toast]);
  
  return {
    status: status || {},
    isLoading,
    isError,
    insights: insightsData?.insights || [],
    recommendedTopics: topicsData?.topics || []
  };
}