import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "./hooks/use-auth";

function TestApp() {
  const { user, isLoading, loginWithGoogle } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading authentication...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">DotSpark Authentication Test</h1>
          {user ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">✓ Authentication Working</p>
              <p>Welcome, {user.displayName || user.email}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-red-600 mb-4">Not authenticated</p>
              <button 
                onClick={loginWithGoogle}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign In with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default TestApp;