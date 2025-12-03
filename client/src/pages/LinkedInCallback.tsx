import { useEffect, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

export default function LinkedInCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from hash fragment
        const hash = window.location.hash;
        const tokenMatch = hash.match(/token=([^&]+)/);
        
        if (!tokenMatch) {
          setStatus('error');
          setMessage('No authentication token received');
          setTimeout(() => setLocation('/'), 3000);
          return;
        }
        
        const customToken = tokenMatch[1];
        
        // Sign in with Firebase custom token
        setMessage('Signing in with LinkedIn...');
        const userCredential = await signInWithCustomToken(auth, customToken);
        
        // Get Firebase ID token
        const idToken = await userCredential.user.getIdToken();
        
        // Sync with backend
        setMessage('Syncing profile...');
        await apiRequest('POST', '/api/auth/login', {
          idToken,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
        });
        
        setStatus('success');
        setMessage('Sign in successful! Redirecting...');
        
        // Clear the hash from URL for security
        window.history.replaceState(null, '', window.location.pathname);
        
        // Redirect to main app
        setTimeout(() => setLocation('/mydotspark'), 1000);
        
      } catch (error: any) {
        console.error('LinkedIn callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        setTimeout(() => setLocation('/'), 3000);
      }
    };
    
    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">LinkedIn Sign In</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Sign In Failed</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to home...</p>
          </>
        )}
      </div>
    </div>
  );
}
