import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function SimpleAuthTest() {
  const [authStatus, setAuthStatus] = useState<string>('Not checked');
  const [dotResult, setDotResult] = useState<string>('');
  const [summary, setSummary] = useState('Test dot from simple auth');
  const [anchor, setAnchor] = useState('This is a test anchor');
  const [pulse, setPulse] = useState('excited');

  const authenticateUser = async () => {
    try {
      setAuthStatus('Authenticating...');
      
      // Use the same mock data that worked in QuickAuthTest
      const mockFirebaseUser = {
        uid: 'test_user_123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      };
      
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(mockFirebaseUser)
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthStatus(`✅ Authenticated as ${data.user?.username || 'user'}`);
      } else {
        setAuthStatus('❌ Authentication failed');
      }
    } catch (error) {
      setAuthStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const createDot = async () => {
    try {
      setDotResult('Creating dot...');
      
      const dotData = {
        summary: summary.substring(0, 220),
        anchor: anchor.substring(0, 300),
        pulse: pulse.split(' ')[0],
        sourceType: 'text'
      };
      
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dotData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setDotResult(`✅ Dot created! ID: ${result.id}`);
      } else {
        const error = await response.json();
        setDotResult(`❌ Failed: ${error.error}`);
      }
    } catch (error) {
      setDotResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const doFullTest = async () => {
    await authenticateUser();
    // Wait a moment for session to be established
    setTimeout(createDot, 1000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Simple Authentication & Dot Creation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Authentication Status:</h3>
            <p className="text-sm">{authStatus}</p>
            <Button onClick={authenticateUser} className="mt-2">
              Authenticate
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Dot Data:</h3>
            <Input 
              placeholder="Summary" 
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <Textarea 
              placeholder="Anchor" 
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
            />
            <Input 
              placeholder="Pulse (one word)" 
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
            />
          </div>
          
          <div>
            <h3 className="font-semibold">Dot Creation Result:</h3>
            <p className="text-sm">{dotResult}</p>
            <div className="space-x-2 mt-2">
              <Button onClick={createDot}>
                Create Dot
              </Button>
              <Button onClick={doFullTest} variant="secondary">
                Full Test (Auth + Create)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}