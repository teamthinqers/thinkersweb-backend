import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickAuthTest() {
  const { user, loginWithGoogle } = useAuth();
  const [backendStatus, setBackendStatus] = useState<any>(null);

  const checkBackend = async () => {
    try {
      const response = await fetch('/api/user', { credentials: 'include' });
      const data = await response.json();
      setBackendStatus({ status: response.status, data });
    } catch (error) {
      setBackendStatus({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testDotCreation = async () => {
    try {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          summary: "Test dot",
          anchor: "Test anchor", 
          pulse: "test",
          sourceType: 'text'
        })
      });
      
      if (response.ok) {
        alert('Dot created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    checkBackend();
  }, [user]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Quick Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Firebase Auth Status:</h3>
            <p>{user ? `Signed in as: ${user.email}` : 'Not signed in'}</p>
            {!user && (
              <Button onClick={loginWithGoogle} className="mt-2">
                Sign In with Google
              </Button>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold">Backend Status:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(backendStatus, null, 2)}
            </pre>
            <Button onClick={checkBackend} className="mt-2">
              Check Backend
            </Button>
          </div>

          <div>
            <Button onClick={testDotCreation} disabled={!user}>
              Test Dot Creation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}