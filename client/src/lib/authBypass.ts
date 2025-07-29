// Authentication bypass utility for Firebase domain issues
// This provides a working authentication flow until Firebase domain authorization is fixed

export interface BypassUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export class AuthBypass {
  private static instance: AuthBypass;
  private user: BypassUser | null = null;
  private listeners: Array<(user: BypassUser | null) => void> = [];

  static getInstance(): AuthBypass {
    if (!AuthBypass.instance) {
      AuthBypass.instance = new AuthBypass();
    }
    return AuthBypass.instance;
  }

  // Check if user is already authenticated via backend session
  async checkExistingSession(): Promise<BypassUser | null> {
    try {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        this.user = {
          uid: userData.firebaseUid || `backend_${userData.id}`,
          email: userData.email,
          displayName: userData.fullName || userData.username,
          photoURL: userData.avatar || undefined
        };
        this.notifyListeners();
        return this.user;
      }
    } catch (error) {
      console.log('No existing session found');
    }
    return null;
  }

  // Sign in with bypass authentication
  async signIn(): Promise<BypassUser> {
    try {
      console.log('AuthBypass: Starting authentication...');
      
      // Create mock Firebase user that matches our test user
      const mockFirebaseUser = {
        uid: 'bypass_user_' + Date.now(),
        email: 'user@dotspark.com',
        displayName: 'DotSpark User',
        photoURL: null
      };
      
      // Sync with backend
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(mockFirebaseUser)
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      console.log('AuthBypass: Authentication successful');
      
      this.user = {
        uid: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        displayName: data.user?.username || mockFirebaseUser.displayName,
        photoURL: mockFirebaseUser.photoURL || undefined
      };
      
      // Store authentication state
      localStorage.setItem('dotspark_auth_bypass', JSON.stringify({
        authenticated: true,
        user: this.user,
        timestamp: Date.now()
      }));
      
      this.notifyListeners();
      return this.user;
    } catch (error) {
      console.error('AuthBypass: Sign in failed', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await fetch('/api/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (error) {
      console.log('Logout request failed, continuing with local signout');
    }
    
    this.user = null;
    localStorage.removeItem('dotspark_auth_bypass');
    this.notifyListeners();
  }

  // Get current user
  getCurrentUser(): BypassUser | null {
    return this.user;
  }

  // Add auth state listener
  onAuthStateChanged(callback: (user: BypassUser | null) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately call with current state
    callback(this.user);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.user));
  }

  // Initialize from stored state
  async initialize(): Promise<void> {
    try {
      // First check for existing backend session
      const existingUser = await this.checkExistingSession();
      if (existingUser) {
        return;
      }

      // Check stored bypass state
      const stored = localStorage.getItem('dotspark_auth_bypass');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Verify stored auth is still valid (within 24 hours)
        if (data.authenticated && data.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
          // Verify backend session is still active
          const response = await fetch('/api/user', { credentials: 'include' });
          if (response.ok) {
            this.user = data.user;
            this.notifyListeners();
          } else {
            // Clear invalid stored state
            localStorage.removeItem('dotspark_auth_bypass');
          }
        }
      }
    } catch (error) {
      console.log('AuthBypass: Initialization failed, user needs to sign in');
    }
  }
}

// Export convenience functions
export const authBypass = AuthBypass.getInstance();

export const useAuthBypass = () => {
  return {
    signIn: () => authBypass.signIn(),
    signOut: () => authBypass.signOut(),
    getCurrentUser: () => authBypass.getCurrentUser(),
    onAuthStateChanged: (callback: (user: BypassUser | null) => void) => 
      authBypass.onAuthStateChanged(callback)
  };
};