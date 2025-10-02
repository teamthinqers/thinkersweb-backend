import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickAuthTest() {
  const { user, loginWithGoogle } = useAuth();
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

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
    const results: string[] = [];
    
    try {
      results.push('Testing dot creation...');
      
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
      
      results.push(`Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        results.push('✅ Dot created successfully!');
        results.push(`Created dot ID: ${data.id}`);
      } else {
        const error = await response.json();
        results.push(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      results.push(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setTestResults(results);
  };

  const testFirebaseDomain = () => {
    const results: string[] = [];
    results.push('🔍 Firebase Configuration Check:');
    results.push(`Current domain: ${window.location.origin}`);
    results.push(`Firebase API Key exists: ${!!import.meta.env.VITE_FIREBASE_API_KEY}`);
    results.push(`Firebase Project ID: ${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}`);
    results.push('');
    results.push('⚠️  For Google sign-in to work, you need to:');
    results.push('1. Go to Firebase Console');
    results.push('2. Authentication > Settings > Authorized domains');
    results.push('3. Add: localhost');
    results.push('4. Add: localhost:5000');
    setTestResults(results);
  };

  const testDirectAuth = async () => {
    const results: string[] = [];
    
    try {
      results.push('🔧 Testing direct authentication bypass...');
      
      // Create a mock Firebase user data to test backend sync
      const mockFirebaseUser = {
        uid: 'test_user_123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      };
      
      results.push('📤 Sending authentication sync to backend...');
      
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(mockFirebaseUser)
      });
      
      results.push(`📊 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        results.push('✅ Backend authentication sync successful!');
        results.push(`Created/found user: ${data.user?.username || 'unknown'}`);
        results.push(`Session ID: ${data.sessionId}`);
        
        // Test if we can now access protected routes
        const userResponse = await fetch('/api/user', { credentials: 'include' });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          results.push('✅ Protected route access confirmed!');
          results.push(`User ID: ${userData.id}`);
        } else {
          results.push('❌ Still cannot access protected routes');
        }
      } else {
        const error = await response.json();
        results.push(`❌ Backend sync failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      results.push(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setTestResults(results);
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

          <div className="space-x-2 space-y-2">
            <Button onClick={testDotCreation}>
              Test Dot Creation
            </Button>
            <Button onClick={testFirebaseDomain} variant="outline">
              Check Firebase Setup
            </Button>
            <Button onClick={testDirectAuth} variant="secondary">
              Test Direct Auth (Bypass Firebase)
            </Button>
          </div>

          {testResults.length > 0 && (
            <div>
              <h3 className="font-semibold">Test Results:</h3>
              <div className="text-sm bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="mb-1">{result}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}