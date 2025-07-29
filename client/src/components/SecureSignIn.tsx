import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function SecureSignIn() {
  const { loginWithGoogle, loginWithBypass, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'production' | 'demo' | null>(null);

  // Check if we're in demo mode
  const isDemoMode = window.location.search.includes('demo=true') || 
                    window.location.pathname.includes('/test-') ||
                    localStorage.getItem('dotspark_demo_mode') === 'true';

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      if (!isDemoMode) {
        throw new Error('Demo mode not available in production');
      }
      await loginWithBypass();
    } catch (error) {
      console.error('Demo sign-in failed:', error);
    }
  };

  if (isDemoMode) {
    return (
      <Card className="max-w-md mx-auto border-2 border-blue-200">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <CardTitle className="text-blue-700">Demo Mode</CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Testing Environment</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Demo Mode Active</p>
                <p>Your data will not be permanently saved. This is for testing only.</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Signing in...' : 'Continue with Demo'}
          </Button>
          
          <div className="text-center">
            <a 
              href="/auth-mode" 
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Switch to Production Mode
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

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