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
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 shadow-[0_8px_30px_rgba(245,158,11,0.25)] px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <Link href="/mydotspark">
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/20 backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4" />
                Back to MyDotSpark
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Cognitive Identity
                </h1>
                <p className="text-sm text-white/90">Define your unique cognitive fingerprint</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8">
            <div className="text-center space-y-6">
              <div className="inline-flex p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-[0_8px_30px_rgba(245,158,11,0.25)]">
                <Fingerprint className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Cognitive Identity Builder
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your cognitive identity represents your unique thinking patterns and mental frameworks. Setup your identity accordingly
              </p>

              <div className="pt-8">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-6 text-lg shadow-[0_8px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.4)]"
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
