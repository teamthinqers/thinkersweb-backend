import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Basic pages for testing
const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <div className="mb-8">
          <img 
            src="/dotspark-logo-icon.jpeg" 
            alt="DotSpark" 
            className="w-16 h-16 mx-auto rounded-full"
          />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-amber-600">DotSpark</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your neural cognitive enhancement platform for capturing, organizing, and connecting thoughts
        </p>
        <div className="space-x-4">
          <a 
            href="/dashboard" 
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Access Dashboard
          </a>
          <a 
            href="/my-neura" 
            className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            My Neura
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My DotSpark Neura
        </h1>
        <p className="text-gray-600">Your neural constellation of connected thoughts</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Total Dots</h3>
          <p className="text-2xl font-bold text-amber-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Neural Wheels</h3>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Connections</h3>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Neural Constellation Map</h2>
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Start saving your Dots to see your neural map</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MyNeura = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Neura Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">DotSpark Activation</h2>
          <div className="flex items-center space-x-4">
            <button className="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700">
              Activate DotSpark
            </button>
            <span className="text-gray-600">Enable neural thought capture</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dot Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold text-gray-900">Voice Only</h3>
              <p className="text-sm text-gray-600">Capture thoughts via voice</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold text-gray-900">Text Only</h3>
              <p className="text-sm text-gray-600">Capture thoughts via text</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer bg-amber-50 border-amber-200">
              <h3 className="font-semibold text-gray-900">Hybrid Mode</h3>
              <p className="text-sm text-gray-600">Both voice and text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <a href="/" className="text-amber-600 hover:text-amber-700 font-semibold">
        Return to Home
      </a>
    </div>
  </div>
);

function AppSimple() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/my-neura" component={MyNeura} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default AppSimple;