import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Settings } from 'lucide-react';

export type AIModel = 'gpt-5' | 'deepseek-chat';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  className?: string;
}

const MODEL_INFO = {
  'gpt-5': {
    name: 'GPT 5.0',
    description: 'Next-gen reasoning & creativity',
    icon: Brain,
    color: 'bg-blue-500',
    badge: 'Latest'
  },
  'deepseek-chat': {
    name: 'DeepSeek',
    description: 'Fast & efficient responses',
    icon: Zap,
    color: 'bg-purple-500',
    badge: 'Fast'
  }
};

export function ModelSelector({ selectedModel, onModelChange, className = '' }: ModelSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Save model preference to localStorage
  useEffect(() => {
    localStorage.setItem('dotsparkAIModel', selectedModel);
  }, [selectedModel]);

  // Load model preference from localStorage on mount
  useEffect(() => {
    const savedModel = localStorage.getItem('dotsparkAIModel') as AIModel;
    if (savedModel && savedModel !== selectedModel) {
      onModelChange(savedModel);
    }
  }, []);

  const currentModelInfo = MODEL_INFO[selectedModel];
  const CurrentIcon = currentModelInfo.icon;

  return (
    <div className={`relative ${className}`}>
      {/* Current Model Display */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 h-8 px-3 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300 ${className.includes('w-full') ? 'justify-start w-full' : ''}`}
      >
        <span className="text-xs font-medium">AI</span>
        <div className={`w-2 h-2 rounded-full ${currentModelInfo.color}`} />
        <span className="text-xs font-medium">{currentModelInfo.name}</span>
        <Settings className="w-3 h-3 opacity-60" />
      </Button>

      {/* Model Selection Dropdown */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[240px] z-50">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
            Choose AI Model
          </div>
          
          {Object.entries(MODEL_INFO).map(([modelKey, info]) => {
            const IconComponent = info.icon;
            const isSelected = modelKey === selectedModel;
            
            return (
              <button
                key={modelKey}
                onClick={() => {
                  onModelChange(modelKey as AIModel);
                  setIsExpanded(false);
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${
                  isSelected 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${info.color} flex-shrink-0`} />
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{info.name}</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1.5 py-0.5 h-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      {info.badge}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {info.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Click outside to close */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}