// Temporary mock auth hook to fix React errors
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    loginWithGoogle: async () => {},
    logout: async () => {}
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};