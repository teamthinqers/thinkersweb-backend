import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Fingerprint } from "lucide-react";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";

export default function CognitiveIdentityPage() {
  return (
    <SharedAuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-amber-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <Link href="/myneura">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to MyNeura
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                  Cognitive Identity
                </h1>
                <p className="text-sm text-gray-600">Define your unique cognitive fingerprint</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8">
            <div className="text-center space-y-6">
              <div className="inline-flex p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full">
                <Fingerprint className="h-16 w-16 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Cognitive Identity Builder
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your cognitive identity represents your unique thinking patterns, learning preferences, 
                and mental frameworks. Complete your profile to unlock personalized AI assistance.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">Step 1</h3>
                  <p className="text-sm text-gray-700">Define your learning style</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">Step 2</h3>
                  <p className="text-sm text-gray-700">Map your knowledge domains</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">Step 3</h3>
                  <p className="text-sm text-gray-700">Set cognitive preferences</p>
                </div>
              </div>

              <div className="pt-8">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg"
                >
                  Start Building Your Identity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedAuthLayout>
  );
}
