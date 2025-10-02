import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function SecureSignIn() {
  const { loginWithGoogle, isLoading } = useAuth();

  // Force production mode - demo mode disabled for all users
  const isDemoMode = false;

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  // Demo mode completely removed - production only

  return (
    <Card className="max-w-md mx-auto border-2 border-green-200">
      <CardHeader className="text-center">
        <Shield className="w-12 h-12 text-green-600 mx-auto mb-2" />
        <CardTitle className="text-green-700">Sign In to DotSpark</CardTitle>
        <Badge variant="default" className="bg-green-100 text-green-800">Secure Authentication</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">
              <p className="font-medium">Production Mode</p>
              <p>Sign in with Google for secure access to all features.</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
        
        <div className="text-center">
          <a 
            href="/auth-mode" 
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Try Demo Mode Instead
          </a>
        </div>
      </CardContent>
    </Card>
  );
}