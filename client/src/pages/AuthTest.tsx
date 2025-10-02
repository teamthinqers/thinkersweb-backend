import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth-new';

const AuthTest: React.FC = () => {
  const { user, isLoading, loginWithGoogle } = useAuth();
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', { credentials: 'include' });
      const data = await response.json();
      setAuthStatus(data);
      addResult(`Auth status: ${data.authenticated ? 'Authenticated' : 'Not authenticated'}`);
      if (data.user) {
        addResult(`User: ${data.user.fullName || data.user.email}`);
      }
    } catch (error) {
      addResult(`Auth status check failed: ${error}`);
    }
  };

  const testGoogleAuth = async () => {
    try {
      addResult('Starting Google authentication...');
      await loginWithGoogle();
      addResult('Google authentication completed');
      setTimeout(checkAuthStatus, 1000); // Check after a delay
    } catch (error) {
      addResult(`Google auth failed: ${error}`);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (user) {
      addResult(`Frontend user updated: ${user.fullName || user.displayName || user.email}`);
    }
  }, [user]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Frontend State</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? user.fullName || user.displayName || user.email || 'Authenticated' : 'None'}</p>
                <p><strong>Email:</strong> {user?.email || 'None'}</p>
                <p><strong>Avatar:</strong> {user?.avatarUrl ? 'Set' : 'None'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Backend Status</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Authenticated:</strong> {authStatus?.authenticated ? 'Yes' : 'No'}</p>
                <p><strong>User ID:</strong> {authStatus?.user?.id || 'None'}</p>
                <p><strong>Full Name:</strong> {authStatus?.user?.fullName || 'None'}</p>
                <p><strong>Email:</strong> {authStatus?.user?.email || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button onClick={testGoogleAuth} disabled={isLoading}>
              Test Google Sign-In
            </Button>
            <Button onClick={checkAuthStatus} variant="outline">
              Check Auth Status
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test Results</h3>
            <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">{result}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTest;