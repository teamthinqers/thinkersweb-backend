import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
// Bypass authentication removed
import { useAuth } from '@/hooks/use-auth';
import { LogIn, CheckCircle } from 'lucide-react';

export default function WorkingDotPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dot, setDot] = useState({
    summary: '',
    anchor: '',
    pulse: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleInputChange = (field: keyof typeof dot, value: string) => {
    setDot(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!dot.summary || !dot.anchor || !dot.pulse) {
      toast({
        title: "Complete All Layers",
        description: "Please fill in all three layers of your dot.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate first to save your dot.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          oneWordSummary: dot.summary.split(' ')[0] || 'Insight',
          summary: dot.summary,
          anchor: dot.anchor,
          pulse: dot.pulse,
          sourceType: 'text',
          rawMode: true // Preserve user input exactly as provided
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dot');
      }

      const result = await response.json();
      
      toast({
        title: "Dot Created Successfully!",
        description: `Dot ID: ${result.id} - Check your dashboard to see it.`,
      });

      // Reset form
      setDot({ summary: '', anchor: '', pulse: '' });
    } catch (error) {
      console.error('Failed to submit dot:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create dot.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    toast({
      title: "Authentication Successful",
      description: "You can now create and save dots!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">
              Working Dot Creation Interface
            </CardTitle>
            <p className="text-center text-amber-100">
              Complete authentication testing system
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Authentication Status */}
            <Card className={`border-2 ${user ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {user ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <LogIn className="w-6 h-6 text-amber-600" />
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {user ? 'Authenticated' : 'Not Authenticated'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user ? `Signed in as: ${user.email}` : 'Please authenticate to save dots'}
                      </p>
                    </div>
                  </div>
                  {!user && (
                    <p className="text-sm text-gray-600">
                      Demo mode removed. Please sign in with Google.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dot Creation Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Layer 1: Dot Summary (max 220 characters)
                </label>
                <Textarea
                  value={dot.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Enter your main insight or thought..."
                  className="min-h-20 border-amber-200 focus:border-amber-500"
                  maxLength={220}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {dot.summary.length}/220 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-700 mb-2">
                  Layer 2: Anchor (max 300 characters)
                </label>
                <Textarea
                  value={dot.anchor}
                  onChange={(e) => handleInputChange('anchor', e.target.value)}
                  placeholder="What makes this thought memorable or significant..."
                  className="min-h-20 border-orange-200 focus:border-orange-500"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {dot.anchor.length}/300 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-red-700 mb-2">
                  Layer 3: Pulse (single emotion word)
                </label>
                <Textarea
                  value={dot.pulse}
                  onChange={(e) => handleInputChange('pulse', e.target.value)}
                  placeholder="excited, curious, focused, inspired..."
                  className="min-h-16 border-red-200 focus:border-red-500"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !dot.summary || !dot.anchor || !dot.pulse}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg font-semibold shadow-lg"
            >
              {isSubmitting ? 'Creating Dot...' : 'Create Dot'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                After creating your dot, check the dashboard at{' '}
                <a href="/dashboard" className="text-amber-600 hover:underline">
                  /dashboard
                </a>
              </p>
              <p className="text-xs text-gray-500">
                This interface demonstrates the complete working authentication and dot creation flow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}