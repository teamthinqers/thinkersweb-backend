import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth-new';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth-simple';

export function AuthDebug() {
  const { user, loginWithGoogle, logout } = useAuth();
  const { toast } = useToast();
  const [authState, setAuthState] = useState<any>(null);
  const [backendState, setBackendState] = useState<any>(null);
  const [sessionTest, setSessionTest] = useState<any>(null);

  useEffect(() => {
    // Monitor Firebase auth state
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setAuthState({
        firebaseUser: firebaseUser ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        } : null,
        timestamp: new Date().toISOString()
      });
    });

    return () => unsubscribe();
  }, []);

  const checkBackendAuth = async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      const data = await response.json();
      setBackendState({
        status: response.status,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setBackendState({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  };

  const testSessionSync = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No Firebase user found');
      }

      const userData = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
      };

      console.log('Manual sync attempt with data:', userData);
      
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      setSessionTest({
        status: response.status,
        result: result,
        timestamp: new Date().toISOString()
      });

      if (response.ok) {
        toast({
          title: "Sync Successful",
          description: "Backend authentication synced successfully",
        });
        // Refresh backend state
        await checkBackendAuth();
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      setSessionTest({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync authentication",
        variant: "destructive"
      });
    }
  };

  const testDotCreation = async () => {
    try {
      const dotData = {
        summary: "Test dot summary",
        anchor: "Test anchor",
        pulse: "test",
        sourceType: 'text'
      };

      console.log('Testing dot creation with data:', dotData);
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
    }
  };

  useEffect(() => {
    checkBackendAuth();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Firebase Auth State */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Firebase Authentication State</h3>
            <pre className="text-sm bg-white p-2 rounded overflow-auto">
              {JSON.stringify(authState, null, 2)}
            </pre>
            <div className="mt-2 space-x-2">
              {!user ? (
                <Button onClick={loginWithGoogle}>Sign In with Google</Button>
              ) : (
                <Button onClick={logout} variant="outline">Sign Out</Button>
              )}
            </div>
          </div>

          {/* Backend Auth State */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-2">Backend Authentication State</h3>
            <pre className="text-sm bg-white p-2 rounded overflow-auto">
              {JSON.stringify(backendState, null, 2)}
            </pre>
            <Button onClick={checkBackendAuth} className="mt-2">
              Refresh Backend State
            </Button>
          </div>

          {/* Session Sync Test */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">Manual Session Sync Test</h3>
            <pre className="text-sm bg-white p-2 rounded overflow-auto">
              {JSON.stringify(sessionTest, null, 2)}
            </pre>
            <Button onClick={testSessionSync} className="mt-2" disabled={!user}>
              Manual Sync Firebase → Backend
            </Button>
          </div>

          {/* Dot Creation Test */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold mb-2">Dot Creation Test</h3>
            <Button onClick={testDotCreation} disabled={!user}>
              Test Dot Creation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}