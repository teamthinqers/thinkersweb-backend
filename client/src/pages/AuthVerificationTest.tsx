import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthVerificationTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [dots, setDots] = useState<any[]>([]);
  const [authLoading, setAuthLoading] = useState(false);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', { credentials: 'include' });
      const data = await response.json();
      setAuthStatus(data);
      console.log('Current auth status:', data);
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  const fetchDots = async () => {
    try {
      const response = await fetch('/api/dots', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDots(data);
        console.log('Fetched dots:', data);
      } else {
        console.error('Dots fetch failed:', response.status);
        setDots([]);
      }
    } catch (error) {
      console.error('Dots fetch error:', error);
      setDots([]);
    }
  };

  const testGoogleAuth = async () => {
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Firebase auth successful:', user.email);
      
      // Get Firebase token and sync with backend
      const token = await user.getIdToken();
      console.log('Syncing with backend...');
      
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firebaseToken: token,
          email: user.email,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.avatarUrl
        })
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Backend sync successful:', userData);
        await checkStatus();
        await fetchDots();
      } else {
        const errorData = await response.json();
        console.error('Backend sync failed:', errorData);
      }
    } catch (error) {
      console.error('Google auth failed:', error);
    }
    setAuthLoading(false);
  };

  const createTestDot = async () => {
    try {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          summary: 'Test dot from AuthVerificationTest',
          anchor: 'Testing complete auth-to-data flow',
          pulse: 'excited',
          sourceType: 'text'
        })
      });
      
      if (response.ok) {
        const newDot = await response.json();
        console.log('Dot created successfully:', newDot);
        await fetchDots(); // Refresh dots list
      } else {
        console.error('Dot creation failed:', response.status);
      }
    } catch (error) {
      console.error('Dot creation error:', error);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchDots();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Verification Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Authentication Status</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Authenticated:</strong> {authStatus?.authenticated ? 'Yes' : 'No'}</p>
                <p><strong>User ID:</strong> {authStatus?.user?.id || 'None'}</p>
                <p><strong>Email:</strong> {authStatus?.user?.email || 'None'}</p>
                <p><strong>Full Name:</strong> {authStatus?.user?.fullName || 'None'}</p>
                <p><strong>Display Name:</strong> {authStatus?.user?.displayName || 'None'}</p>
                <p><strong>Avatar URL:</strong> {authStatus?.user?.avatarUrl ? 'Set' : 'None'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Data Access</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Dots Count:</strong> {dots.length}</p>
                <p><strong>Sample Dot:</strong> {dots[0]?.summary || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button onClick={testGoogleAuth} disabled={authLoading}>
              {authLoading ? 'Authenticating...' : 'Test Google Sign-In'}
            </Button>
            <Button onClick={checkStatus} variant="outline">
              Check Status
            </Button>
            <Button onClick={fetchDots} variant="outline">
              Fetch Dots
            </Button>
            <Button onClick={createTestDot} variant="outline" disabled={!authStatus?.authenticated}>
              Create Test Dot
            </Button>
          </div>

          {dots.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">User's Dots</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dots.map((dot, index) => (
                  <div key={dot.id || index} className="p-2 bg-gray-100 rounded text-sm">
                    <p><strong>Summary:</strong> {dot.summary}</p>
                    <p><strong>Anchor:</strong> {dot.anchor}</p>
                    <p><strong>Pulse:</strong> {dot.pulse}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthVerificationTest;