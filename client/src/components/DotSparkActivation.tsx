/**
 * DotSpark Activation Component
 * Handles activation code generation, redemption, and usage tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Shield, Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface UsageStats {
  tokensUsed: number;
  tokensRemaining: number;
  requestsToday: number;
  isActivated: boolean;
  canUpgrade: boolean;
}

interface DotSparkActivationProps {
  userId?: number;
  onActivationChange?: (activated: boolean) => void;
}

export default function DotSparkActivation({ userId, onActivationChange }: DotSparkActivationProps) {
  const [activationCode, setActivationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const { toast } = useToast();

  // Fetch usage stats on component mount
  useEffect(() => {
    fetchUsageStats();
  }, [userId]);

  const fetchUsageStats = async () => {
    try {
      const endpoint = userId 
        ? `/api/activation/usage/${userId}` 
        : '/api/activation/usage';
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setUsageStats(data.usage);
        setIsActivated(data.usage.isActivated);
        onActivationChange?.(data.usage.isActivated);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const generateCode = async () => {
    if (!userId) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to generate an activation code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/activation/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedCode(data.activationCode);
        toast({
          title: "Activation Code Generated",
          description: "Your DotSpark activation code is ready to use",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const redeemCode = async () => {
    if (!userId) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to redeem an activation code",
        variant: "destructive"
      });
      return;
    }

    if (!activationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter an activation code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/activation/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: activationCode, userId })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsActivated(true);
        onActivationChange?.(true);
        setActivationCode('');
        await fetchUsageStats();
        
        toast({
          title: "🎉 DotSpark Activated!",
          description: "Unlimited AI access enabled. Enjoy unrestricted conversations!",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Activation Failed",
        description: error instanceof Error ? error.message : "Invalid activation code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isActivated) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="w-6 h-6" />
            DotSpark Activated
          </CardTitle>
          <CardDescription className="text-green-600">
            Unlimited AI access enabled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Zap className="w-4 h-4 mr-1" />
              Unlimited Tokens
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Shield className="w-4 h-4 mr-1" />
              Vector Storage
            </Badge>
          </div>
          <p className="text-sm text-green-600 text-center">
            Your conversations are being saved for intelligent context and retrieval.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Usage Stats Card */}
      {usageStats && !isActivated && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Clock className="w-5 h-5" />
              Current Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Daily Tokens</span>
                <span>{usageStats.tokensUsed}/1000</span>
              </div>
              <Progress 
                value={(usageStats.tokensUsed / 1000) * 100} 
                className="h-2"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Requests Today:</span>
              <span>{usageStats.requestsToday}/10</span>
            </div>
            {usageStats.tokensRemaining < 200 && (
              <div className="flex items-center gap-2 p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  Limited tokens remaining. Activate for unlimited access.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Activate DotSpark</CardTitle>
          <CardDescription className="text-center">
            Get unlimited AI responses and vector storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generate Code Section */}
          <div className="space-y-2">
            <Button 
              onClick={generateCode}
              disabled={loading || !userId}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Generating...' : 'Generate Activation Code'}
            </Button>
            
            {generatedCode && (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">Your activation code:</p>
                <code className="text-lg font-mono bg-white px-3 py-1 rounded border">
                  {generatedCode}
                </code>
                <p className="text-xs text-gray-500 mt-2">
                  Save this code for activation
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or redeem code</span>
            </div>
          </div>

          {/* Redeem Code Section */}
          <div className="space-y-2">
            <Input
              placeholder="Enter activation code (e.g., DS-ABC123-XYZ)"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              className="text-center font-mono"
            />
            <Button 
              onClick={redeemCode}
              disabled={loading || !activationCode.trim() || !userId}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {loading ? 'Activating...' : 'Activate DotSpark'}
            </Button>
          </div>

          {!userId && (
            <p className="text-sm text-gray-500 text-center">
              Please sign in to activate DotSpark
            </p>
          )}

          {/* Benefits */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium">DotSpark Benefits:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlimited AI conversations</li>
              <li>• Vector storage for context memory</li>
              <li>• Enhanced semantic search</li>
              <li>• Priority response speed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}