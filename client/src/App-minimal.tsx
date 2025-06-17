import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function MinimalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">DotSpark</h1>
          <p className="text-gray-600 text-center mb-4">
            Your intelligent cognitive enhancement platform
          </p>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Get Started
            </button>
            <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default MinimalApp;