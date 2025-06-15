// Simplified auth hook without React context to fix hooks error
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

// Simplified useAuth hook returns mock data without context
export function useAuth(): AuthContextType {
  return {
    user: null,
    isLoading: false,
    loginWithGoogle: async () => {},
    logout: async () => {}
  };
}