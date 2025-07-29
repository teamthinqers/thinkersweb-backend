import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthTest: React.FC = () => {
  const [email, setEmail] = useState('test@dotspark.com');
  const [uid, setUid] = useState('test_user_browser');
  const [displayName, setDisplayName] = useState('Browser Test User');
  const [result, setResult] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [dots, setDots] = useState<any>(null);

  const testAuthentication = async () => {
    try {
      console.log('Testing authentication...');
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firebaseToken: `test_token_${Date.now()}`,
          email,
          uid,
          displayName
        })
      });
      
      const data = await response.json();
      setResult(data);
      console.log('Auth result:', data);
      
      // Check auth status immediately after
      setTimeout(checkAuthStatus, 100);
    } catch (error) {
      console.error('Auth test failed:', error);
      setResult({ error: error.message });
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      const data = await response.json();
      setAuthStatus(data);
      console.log('Auth status:', data);
    } catch (error) {
      console.error('Status check failed:', error);
      setAuthStatus({ error: error.message });
    }
  };

  const fetchDots = async () => {
    try {
      const response = await fetch('/api/dots', {
        credentials: 'include'
      });
      const data = await response.json();
      setDots(data);
      console.log('Dots result:', data);
    } catch (error) {
      console.error('Dots fetch failed:', error);
      setDots({ error: error.message });
    }
  };

  const createTestDot = async () => {
    try {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          summary: 'Browser test dot',
          anchor: 'Testing from browser',
          pulse: 'excited',
          sourceType: 'text'
        })
      });
      const data = await response.json();
      console.log('Dot creation result:', data);
      
      // Refresh dots after creation
      setTimeout(fetchDots, 100);
    } catch (error) {
      console.error('Dot creation failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">UID</label>
              <Input 
                value={uid} 
                onChange={(e) => setUid(e.target.value)}
                placeholder="User ID"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
              />
            </div>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testAuthentication}>
              Test Authentication
            </Button>
            <Button onClick={checkAuthStatus} variant="outline">
              Check Auth Status
            </Button>
            <Button onClick={fetchDots} variant="outline">
              Fetch Dots
            </Button>
            <Button onClick={createTestDot} variant="outline">
              Create Test Dot
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Authentication Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {authStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Auth Status</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {dots && (
        <Card>
          <CardHeader>
            <CardTitle>Dots Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(dots, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthTest;