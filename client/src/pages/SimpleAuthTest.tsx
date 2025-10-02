import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const SimpleAuthTest: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [dots, setDots] = useState<any[]>([]);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [fetchingDots, setFetchingDots] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', { credentials: 'include' });
      const data = await response.json();
      setAuthStatus(data);
      console.log('Auth status check:', data);
    } catch (error) {
      console.error('Auth status check failed:', error);
    }
  };

  const fetchDots = async () => {
    setFetchingDots(true);
    try {
      const response = await fetch('/api/dots', { credentials: 'include' });
      console.log('Dots fetch response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setDots(data);
        console.log('Dots fetched:', data);
      } else {
        const errorData = await response.text();
        console.error('Dots fetch failed:', response.status, errorData);
        setDots([]);
      }
    } catch (error) {
      console.error('Dots fetch error:', error);
      setDots([]);
    }
    setFetchingDots(false);
  };

  // Auto-check auth status and fetch dots when user changes
  useEffect(() => {
    if (!isLoading) {
      checkAuthStatus();
      if (user) {
        fetchDots();
      }
    }
  }, [user, isLoading]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold">Auth Hook State</h3>
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>User: {user ? user.email || user.displayName || 'Authenticated' : 'None'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Backend Auth Status</h3>
              <p>Authenticated: {authStatus?.authenticated ? 'Yes' : 'No'}</p>
              <p>Backend User: {authStatus?.user?.email || 'None'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Data Access</h3>
              <p>Dots Count: {dots.length}</p>
              <p>Fetching: {fetchingDots ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={checkAuthStatus}>Check Auth Status</Button>
            <Button onClick={fetchDots} disabled={fetchingDots}>
              {fetchingDots ? 'Fetching...' : 'Fetch Dots'}
            </Button>
          </div>

          {dots.length > 0 && (
            <div>
              <h3 className="font-semibold">User's Dots</h3>
              <div className="space-y-2">
                {dots.map((dot, index) => (
                  <div key={dot.id || index} className="p-2 bg-gray-100 rounded">
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

export default SimpleAuthTest;
export { SimpleAuthTest };