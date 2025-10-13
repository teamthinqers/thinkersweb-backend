import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cog } from "lucide-react";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";
import { useToast } from "@/hooks/use-toast";

export default function LearningEnginePage() {
  const { toast } = useToast();

  const handleConfigureClick = () => {
    toast({
      title: "Coming Soon",
      description: "Learning Engine configuration will be available soon!",
    });
  };

  return (
    <SharedAuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100">
        {/* Header */}
        <div className="shadow-[0_8px_30px_rgba(245,158,11,0.4)] px-6 py-4" style={{ backgroundColor: '#F59E0B' }}>
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <Link href="/mydotspark">
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/20 backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4" />
                Back to MyDotSpark
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Cog className="h-6 w-6 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Learning Engine
                </h1>
                <p className="text-sm text-white/90">Configure your personalized learning system</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8">
            <div className="text-center space-y-6">
              <div className="inline-flex p-4 rounded-full shadow-[0_8px_30px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#F59E0B' }}>
                <Cog className="h-16 w-16 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Learning Engine Setup
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your learning engine adapts to your goals, interests, and progress. 
                Configure it to create a personalized learning experience that evolves with you.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="p-6 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#F59E0B' }}>
                  <h3 className="font-semibold text-white mb-2">Learning Goals</h3>
                  <p className="text-sm text-white/90">Define what you want to learn</p>
                </div>
                <div className="p-6 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#F59E0B' }}>
                  <h3 className="font-semibold text-white mb-2">Progress Tracking</h3>
                  <p className="text-sm text-white/90">Monitor your learning journey</p>
                </div>
                <div className="p-6 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#F59E0B' }}>
                  <h3 className="font-semibold text-white mb-2">AI Assistance</h3>
                  <p className="text-sm text-white/90">Get personalized guidance</p>
                </div>
              </div>

              <div className="pt-8">
                <Button 
                  size="lg"
                  onClick={handleConfigureClick}
                  className="text-white px-8 py-6 text-lg shadow-[0_8px_30px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)] hover:opacity-90"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  Configure Learning Engine
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedAuthLayout>
  );
}
