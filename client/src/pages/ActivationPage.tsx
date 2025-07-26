/**
 * DotSpark Activation Page
 * Dedicated page for managing DotSpark activation and usage
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DotSparkActivation from '@/components/DotSparkActivation';
// import { useAuth } from '@/hooks/useAuth';

export default function ActivationPage() {
  // const { user } = useAuth();
  const user = null; // Temporary - will be updated when auth is fixed

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4 text-amber-700 hover:text-amber-800 hover:bg-amber-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-amber-800 mb-2">
              Activate DotSpark
            </h1>
            <p className="text-lg text-amber-600">
              Unlock unlimited AI conversations and advanced features
            </p>
          </div>
        </div>

        {/* Activation Component */}
        <div className="max-w-2xl mx-auto">
          <DotSparkActivation 
            userId={user?.id} 
            onActivationChange={(activated) => {
              if (activated) {
                setTimeout(() => {
                  window.history.back();
                }, 2000);
              }
            }}
          />
        </div>

        {/* Features Overview */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-800 text-center mb-8">
            What You Get with DotSpark
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-amber-200">
              <h3 className="text-xl font-semibold text-amber-700 mb-3">
                🚀 Unlimited AI Access
              </h3>
              <p className="text-amber-600">
                No more token limits or daily restrictions. Chat as much as you want with our advanced AI system.
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-amber-200">
              <h3 className="text-xl font-semibold text-amber-700 mb-3">
                🧠 Vector Memory Storage
              </h3>
              <p className="text-amber-600">
                Your conversations are intelligently stored and indexed for context-aware responses and semantic search.
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-amber-200">
              <h3 className="text-xl font-semibold text-amber-700 mb-3">
                🔍 Advanced Search
              </h3>
              <p className="text-amber-600">
                Find past insights and conversations using semantic search across your entire knowledge base.
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-amber-200">
              <h3 className="text-xl font-semibold text-amber-700 mb-3">
                ⚡ Priority Processing
              </h3>
              <p className="text-amber-600">
                Faster response times and priority access to our most advanced AI models and features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}