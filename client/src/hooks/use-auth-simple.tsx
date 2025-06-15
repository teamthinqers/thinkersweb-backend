// Simple authentication hook without React context - avoids hook errors
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    loginWithGoogle: async () => {
      console.log("Simple auth: Mock login");
    },
    logout: async () => {
      console.log("Simple auth: Mock logout");
    },
  };
}

// No-op auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}