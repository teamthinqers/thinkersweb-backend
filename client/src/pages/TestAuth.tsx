import React, { useState } from 'react';
import { auth, signInWithGoogle, signOut } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update the user state when auth state changes
  auth.onAuthStateChanged((newUser) => {
    setUser(newUser);
  });

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      await signOut();
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Firebase Auth Test</CardTitle>
          <CardDescription>
            Testing Firebase Authentication in Replit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {user.avatarUrl && (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.displayName || 'User'} 
                    className="w-12 h-12 rounded-full" 
                  />
                )}
                <div>
                  <p className="font-medium">{user.displayName || 'Anonymous User'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="border rounded-md p-3 bg-gray-50">
                <p className="text-sm font-medium">User ID:</p>
                <p className="text-xs break-all">{user.uid}</p>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="mb-4">You are not signed in</p>
              <Button onClick={handleLogin} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 text-red-500 text-sm">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          {user && (
            <Button variant="outline" onClick={handleLogout} disabled={loading}>
              {loading ? 'Signing out...' : 'Sign out'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}