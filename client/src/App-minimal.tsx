import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Minimal app component to test React functionality
function MinimalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            DotSpark - Neural Cognitive Platform
          </h1>
          <p className="text-xl text-amber-700 mb-8">
            Your personalized AI system for professional growth and thought capture.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Three-Layer Dots</h3>
              <p className="text-amber-600">Capture thoughts with our revolutionary dot architecture</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Mind Mapping</h3>
              <p className="text-amber-600">Visualize your neural constellation of connected ideas</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">AI Enhancement</h3>
              <p className="text-amber-600">Tunable AI that mirrors your natural intelligence</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg">
              Get Started
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default MinimalApp;