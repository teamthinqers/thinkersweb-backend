import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { api } from '../services/api';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGR4VtPDY0KaT8HlWlf2EVSXwBqX4w-Oc",
  authDomain: "dotspark-8f87c.firebaseapp.com",
  projectId: "dotspark-8f87c",
  storageBucket: "dotspark-8f87c.firebasestorage.app",
  messagingSenderId: "950717649313",
  appId: "1:950717649313:web:1a8e68d7c8259c1c8ad612",
  measurementId: "G-M17W4RY5PQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface User {
  id: number;
  email: string;
  fullName: string | null;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '950717649313-your-android-client-id.apps.googleusercontent.com',
    iosClientId: '950717649313-your-ios-client-id.apps.googleusercontent.com',
    webClientId: '950717649313-u2g0fqisd3gqg8ltq45f8u2oj2j70sqp.apps.googleusercontent.com',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication?.accessToken, authentication?.idToken);
    }
  }, [response]);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (accessToken?: string, idToken?: string) => {
    try {
      if (!idToken) return;
      
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseToken = await userCredential.user.getIdToken();

      const response = await api.post('/auth/firebase', { 
        idToken: firebaseToken 
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        await AsyncStorage.setItem('session', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      await AsyncStorage.setItem('session', JSON.stringify(response.data));
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error initiating Google Sign-In:', error);
    }
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
      await AsyncStorage.removeItem('session');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
