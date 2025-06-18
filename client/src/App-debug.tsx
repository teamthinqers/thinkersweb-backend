import React from "react";

function DebugApp() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-amber-600">DotSpark</h1>
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold">✓ Application Loading Successfully</p>
          <p className="text-gray-600">Your intelligent cognitive enhancement platform</p>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
              Sign In with Google
            </button>
            <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              Explore Features
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            Server Status: Connected
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebugApp;