import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Grid3x3, Heart, Share2, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";

export default function PreviewPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLocation("/")}
              >
                <img 
                  src="/dotspark-logo-combined.png?v=1" 
                  alt="DotSpark" 
                  className="h-10 w-auto object-contain" 
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-sm font-medium text-gray-700 hover:text-amber-600"
              >
                About
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/preview")}
                className="text-sm font-medium text-gray-700 hover:text-amber-600"
              >
                Preview
              </Button>
              {user ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setLocation("/home")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setLocation("/auth")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Preview Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-6">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Platform Preview
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get a glimpse of how DotSpark helps you capture, organize, and share your thoughts.
            </p>
          </div>

          {/* Demo Sections */}
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Thought Cloud Preview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3 mb-2">
                  <Grid3x3 className="h-6 w-6 text-amber-600" />
                  <h2 className="text-2xl font-bold">Thought Cloud</h2>
                </div>
                <p className="text-gray-600">
                  Visualize your ideas as an interactive cloud of connected thoughts.
                </p>
              </div>
              <div className="p-8 bg-gradient-to-br from-amber-50/30 to-orange-50/20 min-h-[300px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-amber-400 opacity-50" />
                  <p className="text-lg">Interactive thought cloud visualization</p>
                  <p className="text-sm mt-2">Sign in to see your personal thought network</p>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Save & Organize</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Save thoughts from the community, organize them into collections, and build your personal knowledge base.
                </p>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                  <p className="text-sm text-gray-600">Example features:</p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Create custom collections</li>
                    <li>• Tag and categorize thoughts</li>
                    <li>• Quick search and filters</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Share Insights</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Make your thoughts public to contribute to collective intelligence, or keep them private for reflection.
                </p>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-sm text-gray-600">Sharing options:</p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Public or private thoughts</li>
                    <li>• Add emotions and images</li>
                    <li>• Engage with community</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Example Thoughts */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-2xl font-bold mb-2">Sample Thoughts</h2>
                <p className="text-gray-600">
                  Here's what thoughts look like in DotSpark.
                </p>
              </div>
              <div className="p-8 space-y-4">
                {/* Sample Thought 1 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors">
                  <h3 className="font-semibold text-lg mb-2">Learning Through Teaching</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    The best way to learn something deeply is to teach it to others. Teaching forces you to organize your thoughts and identify gaps in your knowledge.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">💡 Insight</span>
                    <span>•</span>
                    <span>2 days ago</span>
                  </div>
                </div>

                {/* Sample Thought 2 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors">
                  <h3 className="font-semibold text-lg mb-2">Power of Habits</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Small habits compound over time. Focusing on 1% improvements daily leads to remarkable results over months and years.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">🎯 Goal</span>
                    <span>•</span>
                    <span>5 days ago</span>
                  </div>
                </div>

                {/* Sample Thought 3 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors">
                  <h3 className="font-semibold text-lg mb-2">Creative Constraints</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Limitations can boost creativity. When we have fewer resources or options, we're forced to think more innovatively.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">✨ Idea</span>
                    <span>•</span>
                    <span>1 week ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <h2 className="text-2xl font-bold mb-4">Ready to Build Your Knowledge Network?</h2>
                <p className="text-gray-600 mb-6">
                  Sign in to start capturing and connecting your thoughts.
                </p>
                <Button
                  size="lg"
                  onClick={() => setLocation("/auth")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>© 2025 DotSpark. Building collective intelligence together.</p>
        </div>
      </footer>
    </div>
  );
}
