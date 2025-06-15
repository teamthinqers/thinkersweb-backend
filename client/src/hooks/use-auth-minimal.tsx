import { createContext, useContext } from "react";

type UserInfo = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: {
    uid: 'demo-user',
    email: 'demo@example.com',
    displayName: 'Demo User',
    photoURL: null
  },
  isLoading: false,
  loginWithGoogle: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{
      user: {
        uid: 'demo-user',
        email: 'demo@example.com',
        displayName: 'Demo User',
        photoURL: null
      },
      isLoading: false,
      loginWithGoogle: async () => {},
      logout: async () => {}
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}