import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';

export default function AuthTest() {
  const [, setLocation] = useLocation();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAuthentication = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Test Firebase authentication sync
      const authResponse = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firebaseToken: 'test_token_123',
          email: 'test@example.com',
          uid: `test_user_${Date.now()}`,
          displayName: 'Test User'
        })
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        setTestResult(`✅ Authentication successful: ${JSON.stringify(authData, null, 2)}`);
        
        // Test dots creation
        const dotResponse = await fetch('/api/dots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            summary: 'Test authentication dot',
            anchor: 'Testing if user can create dots after authentication',
            pulse: 'focused'
          })
        });

        if (dotResponse.ok) {
          const dotData = await dotResponse.json();
          setTestResult(prev => prev + `\n\n✅ Dot creation successful: ${JSON.stringify(dotData, null, 2)}`);
          
          // Test fetching dots
          const fetchResponse = await fetch('/api/dots', {
            credentials: 'include'
          });
          
          if (fetchResponse.ok) {
            const fetchedDots = await fetchResponse.json();
            setTestResult(prev => prev + `\n\n✅ Dots fetch successful: Found ${fetchedDots.length} dots`);
          } else {
            setTestResult(prev => prev + `\n\n❌ Dots fetch failed: ${fetchResponse.status}`);
          }
        } else {
          setTestResult(prev => prev + `\n\n❌ Dot creation failed: ${dotResponse.status}`);
        }
      } else {
        setTestResult(`❌ Authentication failed: ${authResponse.status}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testAuthentication} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing Authentication...' : 'Test Auth & Dot Creation'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setLocation('/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
              {testResult}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { AuthTest };