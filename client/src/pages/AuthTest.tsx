import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function AuthTest() {
  const { user, isLoading, loginWithGoogle, logout } = useAuth();
  const { toast } = useToast();
  const [dotData, setDotData] = useState({
    summary: 'Test dot for debugging authentication flow',
    anchor: 'This is a test to see if authentication works correctly',
    pulse: 'testing'
  });
  const [creating, setCreating] = useState(false);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Success",
        description: "Successfully signed in with Google",
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Error",
        description: "Failed to sign in",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const testDotCreation = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in first",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      console.log('Creating test dot with data:', dotData);
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dotData)
      });

      console.log('Dot creation response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Dot creation error:', error);
        throw new Error(error.error || 'Failed to create dot');
      }

      const result = await response.json();
      console.log('Dot created successfully:', result);
      
      toast({
        title: "Success!",
        description: "Test dot created successfully",
      });
    } catch (error) {
      console.error('Failed to create dot:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create dot",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const testFetchDots = async () => {
    try {
      console.log('Fetching dots...');
      const response = await fetch('/api/dots', {
        credentials: 'include'
      });
      
      console.log('Fetch dots response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Fetch dots error:', error);
        throw new Error(error.error || 'Failed to fetch dots');
      }

      const dots = await response.json();
      console.log('Dots fetched successfully:', dots);
      
      toast({
        title: "Success!",
        description: `Fetched ${dots.length} dots`,
      });
    } catch (error) {
      console.error('Failed to fetch dots:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch dots",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentication & Dot Creation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Status */}
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            {user ? (
              <div>
                <p><strong>User:</strong> {user.displayName || user.email}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>UID:</strong> {user.uid}</p>
                <Button onClick={handleLogout} variant="outline" className="mt-2">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div>
                <p>Not signed in</p>
                <Button onClick={handleLogin} className="mt-2">
                  Sign In with Google
                </Button>
              </div>
            )}
          </div>

          {/* Dot Creation Test */}
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Dot Creation Test</h3>
            <div className="space-y-2">
              <Input
                placeholder="Summary"
                value={dotData.summary}
                onChange={(e) => setDotData({ ...dotData, summary: e.target.value })}
              />
              <Input
                placeholder="Anchor"
                value={dotData.anchor}
                onChange={(e) => setDotData({ ...dotData, anchor: e.target.value })}
              />
              <Input
                placeholder="Pulse (one word)"
                value={dotData.pulse}
                onChange={(e) => setDotData({ ...dotData, pulse: e.target.value })}
              />
              <Button 
                onClick={testDotCreation} 
                disabled={creating || !user}
                className="w-full"
              >
                {creating ? 'Creating...' : 'Create Test Dot'}
              </Button>
            </div>
          </div>

          {/* Fetch Test */}
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Fetch Dots Test</h3>
            <Button onClick={testFetchDots} className="w-full">
              Fetch My Dots
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}