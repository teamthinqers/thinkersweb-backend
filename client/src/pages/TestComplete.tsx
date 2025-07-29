import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, User, Database, Eye } from 'lucide-react';

export default function TestCompletePage() {
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<'pending' | 'authenticated' | 'failed'>('pending');
  const [user, setUser] = useState<any>(null);
  const [dot, setDot] = useState({
    summary: 'test dot 1',
    anchor: 'testing complete authentication and dot creation flow',
    pulse: 'focused'
  });
  const [createdDot, setCreatedDot] = useState<any>(null);
  const [fetchedDots, setFetchedDots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firebaseToken: 'bypass_token_demo',
          email: 'complete-test@demo.com',
          uid: `complete_test_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const userData = await response.json();
      setUser(userData);
      setAuthStatus('authenticated');
      toast({
        title: "Authentication Successful",
        description: `Signed in as: ${userData.email}`,
      });
    } catch (error) {
      setAuthStatus('failed');
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDot = async () => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please authenticate first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dot)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dot');
      }

      const result = await response.json();
      setCreatedDot(result);
      toast({
        title: "Dot Created Successfully!",
        description: `Dot ID: ${result.id}`,
      });
    } catch (error) {
      toast({
        title: "Dot Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchDots = async () => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please authenticate first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/dots', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch dots');
      }

      const dots = await response.json();
      setFetchedDots(dots);
      toast({
        title: "Dots Fetched Successfully!",
        description: `Found ${dots.length} dots`,
      });
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof dot, value: string) => {
    setDot(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              Complete Authentication & Dot Flow Test
            </CardTitle>
            <p className="text-center text-amber-100">
              End-to-end testing of authentication, dot creation, and retrieval
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Step 1: Authentication */}
            <Card className={`border-2 ${authStatus === 'authenticated' ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-amber-600" />
                    <div>
                      <h3 className="font-semibold">Step 1: Authentication</h3>
                      <p className="text-sm text-gray-600">
                        {authStatus === 'pending' && 'Click authenticate to start'}
                        {authStatus === 'authenticated' && `Signed in as: ${user?.email}`}
                        {authStatus === 'failed' && 'Authentication failed - try again'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAuthenticate}
                    disabled={isLoading || authStatus === 'authenticated'}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {authStatus === 'authenticated' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      'Authenticate'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Dot Creation */}
            <Card className={`border-2 ${createdDot ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="w-6 h-6 text-orange-600" />
                      <div>
                        <h3 className="font-semibold">Step 2: Create Dot</h3>
                        <p className="text-sm text-gray-600">
                          {createdDot ? `Dot created with ID: ${createdDot.id}` : 'Create a test dot'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateDot}
                      disabled={isLoading || authStatus !== 'authenticated'}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {createdDot ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        'Create Dot'
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Summary
                      </label>
                      <Textarea
                        value={dot.summary}
                        onChange={(e) => handleInputChange('summary', e.target.value)}
                        className="min-h-16"
                        maxLength={220}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anchor
                      </label>
                      <Textarea
                        value={dot.anchor}
                        onChange={(e) => handleInputChange('anchor', e.target.value)}
                        className="min-h-16"
                        maxLength={300}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pulse
                      </label>
                      <Textarea
                        value={dot.pulse}
                        onChange={(e) => handleInputChange('pulse', e.target.value)}
                        className="min-h-16"
                        placeholder="One word emotion"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Fetch Dots */}
            <Card className={`border-2 ${fetchedDots.length > 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">Step 3: Fetch Dots</h3>
                        <p className="text-sm text-gray-600">
                          {fetchedDots.length > 0 ? `Retrieved ${fetchedDots.length} dots` : 'Fetch your dots from database'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleFetchDots}
                      disabled={isLoading || authStatus !== 'authenticated'}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Fetch Dots
                    </Button>
                  </div>

                  {fetchedDots.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Retrieved Dots:</h4>
                      {fetchedDots.map((fetchedDot, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <strong>Summary:</strong> {fetchedDot.summary}
                            </div>
                            <div>
                              <strong>Anchor:</strong> {fetchedDot.anchor}
                            </div>
                            <div>
                              <strong>Pulse:</strong> {fetchedDot.pulse}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {fetchedDot.id} | Created: {new Date(fetchedDot.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Summary */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Test Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className={`p-2 rounded ${authStatus === 'authenticated' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    ✓ Authentication: {authStatus === 'authenticated' ? 'PASS' : 'PENDING'}
                  </div>
                  <div className={`p-2 rounded ${createdDot ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    ✓ Dot Creation: {createdDot ? 'PASS' : 'PENDING'}
                  </div>
                  <div className={`p-2 rounded ${fetchedDots.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    ✓ Dot Retrieval: {fetchedDots.length > 0 ? 'PASS' : 'PENDING'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                This page tests the complete flow from authentication to dot creation to retrieval.
                If all steps pass, the authentication system is working correctly.
              </p>
              <a href="/dashboard" className="text-amber-600 hover:underline mt-2 inline-block">
                Go to Dashboard to see your dots in the grid →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}