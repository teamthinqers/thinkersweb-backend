// Simple mock auth hook to avoid React hooks context issues
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    loginWithGoogle: async () => {
      console.log("Login temporarily disabled");
    },
    logout: async () => {
      console.log("Logout temporarily disabled");
    }
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};