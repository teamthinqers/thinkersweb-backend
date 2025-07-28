import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, ArrowLeft, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import UserGrid from '@/components/UserGrid';
import DotFullView from '@/components/DotFullView';
import WheelFullView from '@/components/WheelFullView';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [previewMode, setPreviewMode] = useState(!user); // Auto-enable preview for unsigned users
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecentFilter, setShowRecentFilter] = useState(false);
  const [recentDotsCount, setRecentDotsCount] = useState(4);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [viewFullDot, setViewFullDot] = useState<any>(null);
  const [viewFullWheel, setViewFullWheel] = useState<any>(null);

  // Auto-switch to preview mode for unauthenticated users
  useEffect(() => {
    if (!user) {
      setPreviewMode(true);
    }
  }, [user]);

  // Fetch data for authenticated users only
  const { data: dots = [], isLoading: dotsLoading } = useQuery({
    queryKey: ['/api/dots'],
    enabled: !!user && !previewMode
  });

  const { data: wheels = [], isLoading: wheelsLoading } = useQuery({
    queryKey: ['/api/wheels'],
    enabled: !!user && !previewMode
  });

  const { data: userWheels = [], isLoading: userWheelsLoading } = useQuery({
    queryKey: ['/api/user-content/wheels'],
    enabled: !!user && !previewMode
  });

  // Search functionality
  const searchResults = {
    dots: [],
    wheels: [],
    chakras: []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-600" />
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-7 h-7 text-amber-600" />
              <h1 className="text-2xl font-bold text-amber-800">My DotSpark Neura</h1>
            </div>
          </div>

          {/* Right side - Preview Mode Toggle */}
          <div className="flex items-center gap-1 md:gap-2 bg-white border border-amber-200 rounded-lg px-2 py-1 md:px-3 md:py-2">
            <label className="text-xs md:text-sm font-medium text-amber-800">Preview Mode</label>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`relative inline-flex h-4 w-7 md:h-5 md:w-9 items-center rounded-full transition-colors ${
                previewMode ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-2 w-2 md:h-3 md:w-3 transform rounded-full bg-white transition-transform ${
                  previewMode ? 'translate-x-4 md:translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {!isMapFullscreen && (
            <>
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" />
                <input
                  type="text"
                  placeholder="Enter keywords to search for a Dot"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-amber-200 rounded-xl text-amber-900 placeholder-amber-500/70 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-amber-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-amber-500" />
                  </button>
                )}
              </div>

              {/* Recent Dots Section - only show when there's content */}
              {dots.length > 0 && !searchQuery && (
                <div className="bg-white rounded-xl p-4 border-2 border-amber-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-amber-800 mb-4">Recent Dots</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {dots.slice(0, 4).map((dot: any) => (
                      <div
                        key={dot.id}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setViewFullDot(dot)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-amber-800 text-sm">{dot.oneWordSummary || 'Dot'}</h4>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                            {dot.pulse}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{dot.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Main Content Area */}
          <div className={`transition-all duration-200 ${showRecentFilter ? 'mt-4' : 'mt-0'}`}>
            {!previewMode ? (
              <UserGrid 
                userId={user?.id as number | undefined} 
                mode="real" 
              />
            ) : (
              <div className="bg-white rounded-xl p-6 border-2 border-amber-200 shadow-sm">
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-amber-600" />
                  <h3 className="text-2xl font-bold text-amber-800 mb-2">Preview Mode Active</h3>
                  <p className="text-amber-700 mb-6 max-w-md mx-auto">
                    You're viewing demonstration data. This showcases how DotSpark organizes thoughts into Dots, Wheels, and Chakras.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                      <div className="w-8 h-8 bg-amber-500 rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-amber-800 mb-1">Dots</h4>
                      <p className="text-sm text-amber-600">Individual insights and thoughts</p>
                      <div className="text-xs text-amber-500 mt-2">Demo: 26 dots</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                      <div className="w-8 h-8 border-2 border-orange-500 border-dashed rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-orange-800 mb-1">Wheels</h4>
                      <p className="text-sm text-orange-600">Goal-oriented collections of dots</p>
                      <div className="text-xs text-orange-500 mt-2">Demo: 5 wheels</div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mx-auto mb-2"></div>
                      <h4 className="font-semibold text-amber-800 mb-1">Chakras</h4>
                      <p className="text-sm text-amber-600">Life-level purpose containers</p>
                      <div className="text-xs text-amber-500 mt-2">Demo: 2 chakras</div>
                    </div>
                  </div>
                  
                  {!user && (
                    <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-amber-700 mb-3">
                        Ready to organize your own thoughts?
                      </p>
                      <button
                        onClick={() => window.location.href = '/auth'}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Sign In to Get Started
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Dot View Dialog */}
      {viewFullDot && (
        <DotFullView 
          dot={viewFullDot} 
          onClose={() => setViewFullDot(null)}
          onDelete={(dotId) => {
            setViewFullDot(null);
            window.location.reload();
          }}
        />
      )}

      {/* Wheel Full View Modal */}
      {viewFullWheel && (
        <WheelFullView 
          wheel={viewFullWheel}
          isOpen={!!viewFullWheel}
          onClose={() => setViewFullWheel(null)}
          onDelete={async (wheelId) => {
            try {
              await fetch(`/api/wheels/${wheelId}`, { method: 'DELETE' });
            } catch (error) {
              console.error('Error deleting wheel:', error);
            }
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;