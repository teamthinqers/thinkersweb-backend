/**
 * Usage Limit Banner Component
 * Shows usage warnings and activation prompts for non-activated users
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap } from 'lucide-react';

interface UsageLimitBannerProps {
  tokensUsed: number;
  tokensRemaining: number;
  isActivated: boolean;
  onActivateClick: () => void;
}

export default function UsageLimitBanner({ 
  tokensUsed, 
  tokensRemaining, 
  isActivated, 
  onActivateClick 
}: UsageLimitBannerProps) {
  if (isActivated) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <Zap className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Your DotSpark is now active and ready to assist you
        </AlertDescription>
      </Alert>
    );
  }

  const totalTokens = tokensUsed + tokensRemaining;
  const usagePercentage = (tokensUsed / totalTokens) * 100;
  const isNearLimit = tokensRemaining < 200;
  const isAtLimit = tokensRemaining <= 0;

  if (isAtLimit) {
    return (
      <Alert className="bg-red-50 border-red-200 mb-4">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-700">
            Daily token limit reached. Activate DotSpark for unlimited access.
          </span>
          <Button 
            size="sm" 
            onClick={onActivateClick}
            className="bg-red-600 hover:bg-red-700"
          >
            Activate
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isNearLimit) {
    return (
      <Alert className="bg-amber-50 border-amber-200 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-amber-700">
              {tokensRemaining} tokens remaining today
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onActivateClick}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Activate for Unlimited
            </Button>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-blue-50 border-blue-200 mb-4">
      <AlertDescription className="flex items-center justify-between">
        <span className="text-blue-700">
          {tokensRemaining} tokens remaining today
        </span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onActivateClick}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          Upgrade to Unlimited
        </Button>
      </AlertDescription>
    </Alert>
  );
}