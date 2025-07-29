import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function WorkingDotTest() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [summary, setSummary] = useState('My first working dot');
  const [anchor, setAnchor] = useState('This proves the authentication and dot creation system works perfectly');
  const [pulse, setPulse] = useState('excited');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const authenticate = async () => {
    try {
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
        setIsAuthenticated(true);
        toast({
          title: "Authentication Successful",
          description: "You can now create dots!"
        });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const createDot = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate first",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
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
        toast({
          title: "Dot Created Successfully!",
          description: `Your dot has been saved with ID: ${result.id}`
        });
        
        // Clear form
        setSummary('');
        setAnchor('');
        setPulse('');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dot');
      }
    } catch (error) {
      toast({
        title: "Dot Creation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const doFullFlow = async () => {
    await authenticate();
    // Wait for session to be established
    setTimeout(createDot, 1000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Working Dot Creation System</CardTitle>
          <p className="text-sm text-gray-600">
            This demonstrates the fully working authentication and dot creation flow
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold">Authentication Status</h3>
              <p className="text-sm text-gray-600">
                {isAuthenticated ? '✅ Authenticated & Ready' : '❌ Not Authenticated'}
              </p>
            </div>
            <Button 
              onClick={authenticate} 
              disabled={isAuthenticated}
              variant={isAuthenticated ? "outline" : "default"}
            >
              {isAuthenticated ? 'Authenticated' : 'Authenticate'}
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Create Your Dot</h3>
            
            <div>
              <label className="text-sm font-medium">Summary (Layer 1)</label>
              <Input 
                placeholder="Enter your main insight or thought..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={220}
              />
              <p className="text-xs text-gray-500 mt-1">{summary.length}/220 characters</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Anchor (Layer 2)</label>
              <Textarea 
                placeholder="Add context or supporting details..."
                value={anchor}
                onChange={(e) => setAnchor(e.target.value)}
                maxLength={300}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">{anchor.length}/300 characters</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Pulse (Layer 3)</label>
              <Input 
                placeholder="One word emotion (excited, focused, curious...)"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={createDot}
              disabled={!isAuthenticated || isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Dot'}
            </Button>
            <Button 
              onClick={doFullFlow}
              variant="secondary"
              disabled={isCreating}
            >
              Full Flow Test
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            <p><strong>How it works:</strong></p>
            <p>1. Click "Authenticate" to establish a session with the backend</p>
            <p>2. Fill in your dot details (summary, anchor, pulse)</p>
            <p>3. Click "Create Dot" to save it to the database</p>
            <p>4. Your dot will appear in the dashboard at <a href="/dashboard" className="text-blue-500 hover:underline">/dashboard</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}