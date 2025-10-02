import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth-new';

export default function ProductionTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, loginWithGoogle } = useAuth();

  const addResult = (step: string, success: boolean, data?: any) => {
    setTestResults(prev => [...prev, { step, success, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runProductionAuthTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Step 1: Check if user is already authenticated
      if (user) {
        addResult('Check Auth Status', true, `User already authenticated: ${user.email}`);
      } else {
        addResult('Check Auth Status', false, 'No user authenticated');
      }

      // Step 2: Test backend session
      const sessionResponse = await fetch('/api/user', { credentials: 'include' });
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        addResult('Backend Session Check', true, sessionData);
      } else {
        addResult('Backend Session Check', false, `Status: ${sessionResponse.status}`);
      }

      // Step 3: Test dot fetching
      const dotsResponse = await fetch('/api/dots', { credentials: 'include' });
      if (dotsResponse.ok) {
        const dotsData = await dotsResponse.json();
        addResult('Fetch Dots', true, `Found ${dotsData.length} dots`);
      } else {
        addResult('Fetch Dots', false, `Status: ${dotsResponse.status}`);
      }

    } catch (error) {
      addResult('Test Error', false, error);
    } finally {
      setIsRunning(false);
    }
  };

  const authenticateAndTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Step 1: Authentication
      addResult('Starting Authentication', true, 'Attempting login...');
      
      const authResponse = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firebaseToken: 'bypass_token_demo',
          email: 'production-test@demo.com',
          uid: `production_test_${Date.now()}`
        })
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        addResult('✅ Authentication', true, authData);
      } else {
        addResult('❌ Authentication', false, `Status: ${authResponse.status}`);
        return;
      }

      // Step 2: Create a Dot
      const dotResponse = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          summary: 'Production test dot - comprehensive three-tier system',
          anchor: 'Testing complete Dots, Wheels, and Chakras creation and retrieval flow',
          pulse: 'confident'
        })
      });

      if (dotResponse.ok) {
        const dotData = await dotResponse.json();
        addResult('✅ Create Dot', true, dotData);
      } else {
        addResult('❌ Create Dot', false, `Status: ${dotResponse.status}`);
      }

      // Step 3: Create a Wheel
      const wheelResponse = await fetch('/api/wheels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          heading: 'Production Testing Wheel',
          goals: 'Test wheel creation and ensure it appears in the grid visualization',
          timeline: '1-2 weeks for complete testing validation',
          chakraId: null, // Standalone wheel
          sourceType: 'text'
        })
      });

      if (wheelResponse.ok) {
        const wheelData = await wheelResponse.json();
        addResult('✅ Create Wheel', true, wheelData);
      } else {
        addResult('❌ Create Wheel', false, `Status: ${wheelResponse.status}`);
      }

      // Step 4: Create a Chakra
      const chakraResponse = await fetch('/api/chakras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          heading: 'Production Testing Chakra',
          purpose: 'Ensure complete three-tier system works: users can create dots, wheels, and chakras and see them in the grid',
          timeline: 'Ongoing system verification and quality assurance',
          sourceType: 'text'
        })
      });

      if (chakraResponse.ok) {
        const chakraData = await chakraResponse.json();
        addResult('✅ Create Chakra', true, chakraData);
      } else {
        addResult('❌ Create Chakra', false, `Status: ${chakraResponse.status}`);
      }

      // Step 5: Fetch all content to verify grid display
      const [dotsRes, wheelsRes, gridRes] = await Promise.all([
        fetch('/api/dots', { credentials: 'include' }),
        fetch('/api/wheels', { credentials: 'include' }),
        fetch('/api/grid/positions', { credentials: 'include' })
      ]);

      if (dotsRes.ok) {
        const dotsData = await dotsRes.json();
        addResult('✅ Fetch Dots', true, `Found ${dotsData.length} dots`);
      } else {
        addResult('❌ Fetch Dots', false, `Status: ${dotsRes.status}`);
      }

      if (wheelsRes.ok) {
        const wheelsData = await wheelsRes.json();
        addResult('✅ Fetch Wheels & Chakras', true, `Found ${wheelsData.length} wheels/chakras`);
      } else {
        addResult('❌ Fetch Wheels & Chakras', false, `Status: ${wheelsRes.status}`);
      }

      if (gridRes.ok) {
        const gridData = await gridRes.json();
        addResult('✅ Grid Visualization Ready', true, `Statistics: ${JSON.stringify(gridData.data?.statistics || {})}`);
      } else {
        addResult('❌ Grid Visualization', false, `Status: ${gridRes.status}`);
      }

    } catch (error) {
      addResult('❌ System Error', false, error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Production Authentication Test</CardTitle>
            <CardDescription>
              Test the complete authentication and dot creation flow for production deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={runProductionAuthTest} 
                disabled={isRunning}
                variant="outline"
              >
                Test Current Auth Status
              </Button>
              <Button 
                onClick={authenticateAndTest} 
                disabled={isRunning}
              >
                Complete Auth + Dot Test
              </Button>
            </div>

            {user && (
              <div className="p-4 bg-green-50 rounded-lg">
                <strong>Current User:</strong> {user.email || 'No email'} 
                {user.uid && ` (UID: ${user.uid.substring(0, 8)}...)`}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    result.success 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{result.step}</span>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  {result.data && (
                    <pre className="text-xs mt-2 text-gray-600 whitespace-pre-wrap">
                      {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}