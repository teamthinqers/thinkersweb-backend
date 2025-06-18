// Simple auth hook without context to fix React hooks error
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    loginWithGoogle: async () => {},
    logout: async () => {}
  };
}