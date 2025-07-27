import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Brain, ArrowLeft, Mic, Type, Settings, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import DotFullView from '@/components/DotFullView';
import WheelFullView from '@/components/WheelFullView';

interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId?: string;
  timestamp: Date | string;
  sourceType: 'voice' | 'text' | 'hybrid';
  captureMode: 'natural' | 'ai';
  position?: { x: number; y: number };
}

interface Wheel {
  id: string;
  name: string;
  heading: string;
  goals: string;
  purpose?: string;
  timeline: string;
  category: string;
  color: string;
  dots: Dot[];
  connections: string[];
  position: { x: number; y: number };
  chakraId?: string;
  createdAt: Date | string;
}

interface SearchResults {
  dots: Dot[];
  wheels: Wheel[];
  chakras: Wheel[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({ dots: [], wheels: [], chakras: [] });
  const [previewMode, setPreviewMode] = useState(true); // Start in preview mode for demonstration
  const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
  const [viewFullWheel, setViewFullWheel] = useState<Wheel | null>(null);
  const [showingRecentFilter, setShowingRecentFilter] = useState(false);
  const [recentCount, setRecentCount] = useState(10);

  // Check DotSpark activation status for real mode
  const { data: activationStatus, isLoading: activationLoading } = useQuery({
    queryKey: ['/api/activation/status'],
    enabled: !!user && !previewMode, // Only check when user is authenticated and not in preview mode
  });

  // Fetch dots - routes to correct endpoint based on preview mode
  const { data: dots = [], isLoading: dotsLoading, refetch: refetchDots } = useQuery({
    queryKey: previewMode ? ['/api/preview/dots'] : ['/api/dots'],
    queryFn: async () => {
      try {
        const endpoint = previewMode ? '/api/preview/dots' : '/api/dots';
        const response = await fetch(endpoint);
        if (!response.ok) return [];
        return response.json();
      } catch (error) {
        return [];
      }
    },
    retry: false,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch wheels - routes to correct endpoint based on preview mode
  const { data: userWheels = [], isLoading: wheelsLoading, refetch: refetchWheels } = useQuery({
    queryKey: previewMode ? ['/api/preview/wheels'] : ['/api/wheels'],
    queryFn: async () => {
      try {
        const endpoint = previewMode ? '/api/preview/wheels' : '/api/wheels';
        const response = await fetch(endpoint);
        if (!response.ok) return [];
        return response.json();
      } catch (error) {
        return [];
      }
    },
    retry: false,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch grid positions - routes to correct endpoint based on preview mode
  const { data: gridData, isLoading: gridLoading, refetch: refetchGrid } = useQuery({
    queryKey: previewMode ? ['/api/preview/grid-positions'] : ['/api/grid/positions'],
    queryFn: async () => {
      try {
        const endpoint = previewMode ? '/api/preview/grid-positions' : '/api/grid/positions';
        const response = await fetch(endpoint);
        if (!response.ok) {
          return { data: { dotPositions: {}, wheelPositions: {}, chakraPositions: {}, statistics: { totalDots: 0, totalWheels: 0, totalChakras: 0, freeDots: 0 } } };
        }
        return response.json();
      } catch (error) {
        return { data: { dotPositions: {}, wheelPositions: {}, chakraPositions: {}, statistics: { totalDots: 0, totalWheels: 0, totalChakras: 0, freeDots: 0 } } };
      }
    },
    retry: false,
    staleTime: 60000,
  });

  // Search functionality
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setShowSearchResults(false);
      return;
    }

    const keywords = term.toLowerCase().split(' ').filter(k => k.length > 0);

    // Search dots
    const filteredDots = dots.filter((dot: Dot) => {
      const searchText = [
        dot.oneWordSummary,
        dot.summary,
        dot.anchor,
        dot.pulse,
        dot.sourceType,
        dot.captureMode
      ].join(' ').toLowerCase();
      
      return keywords.some(keyword => searchText.includes(keyword));
    });

    // Search wheels
    const filteredWheels = userWheels.filter((wheel: Wheel) => {
      const searchText = [
        wheel.name,
        wheel.heading || '',
        wheel.goals || '',
        wheel.purpose || '',
        wheel.timeline || '',
        wheel.category
      ].join(' ').toLowerCase();
      
      return keywords.some(keyword => searchText.includes(keyword));
    });

    // Separate wheels from chakras
    const regularWheels = filteredWheels.filter(w => w.chakraId !== null && w.chakraId !== undefined);
    const chakras = filteredWheels.filter(w => w.chakraId === null || w.chakraId === undefined);

    setSearchResults({
      dots: filteredDots,
      wheels: regularWheels,
      chakras: chakras
    });
    setShowSearchResults(true);
  };

  // Handle search functionality
  React.useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, dots, userWheels, previewMode]);

  const DotCard: React.FC<{ dot: Dot; isPreview?: boolean; onClick?: () => void }> = ({ dot, isPreview = false, onClick }) => {
    const handleDotClick = () => {
      if (onClick) {
        onClick();
      } else {
        setViewFullDot(dot);
      }
    };

    return (
      <Card className={`mb-4 hover:shadow-md transition-shadow border border-amber-200 bg-white/95 backdrop-blur cursor-pointer hover:bg-amber-50/50`} onClick={handleDotClick}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50/80">
                {dot.sourceType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : 
                 dot.sourceType === 'text' ? <Type className="h-3 w-3 mr-1" /> : 
                 <div className="flex gap-1"><Mic className="h-2 w-2" /><Type className="h-2 w-2" /></div>}
                {dot.sourceType}
              </Badge>
              {isPreview && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                  Preview
                </Badge>
              )}
            </div>
            <span className="text-xs text-amber-600 font-medium">
              {typeof dot.timestamp === 'string' ? new Date(dot.timestamp).toLocaleDateString() : dot.timestamp.toLocaleDateString()}
            </span>
          </div>
          <CardTitle className="text-lg text-amber-800 leading-tight">
            {dot.oneWordSummary}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 mb-2 leading-relaxed">
            {dot.summary}
          </p>
          <div className="flex justify-between items-center text-xs text-amber-600">
            <span className="bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              ✨ {dot.pulse}
            </span>
            <span className="text-amber-500">
              {dot.captureMode}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Toggle between preview and real mode
  const togglePreviewMode = () => {
    // Only allow switching to real mode if user is authenticated
    if (!previewMode && !user) {
      alert('Please sign in to access your personal DotSpark data');
      return;
    }
    setPreviewMode(!previewMode);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  // Activate DotSpark for user
  const activateDotSpark = async () => {
    try {
      const response = await fetch('/api/activation/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        window.location.reload(); // Refresh to update activation status
      }
    } catch (error) {
      console.error('Error activating DotSpark:', error);
    }
  };

  // Component to handle actual data display
  const DataDisplayComponent = () => {
    // Check if user needs to sign in for real mode
    if (!previewMode && !user) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Brain className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-4">
              Please sign in to access your personal DotSpark data and create your cognitive map.
            </p>
            <Button onClick={() => window.location.href = '/auth'} className="bg-amber-600 hover:bg-amber-700">
              Sign In to DotSpark
            </Button>
          </div>
        </div>
      );
    }

    // Check DotSpark activation status for real mode
    if (!previewMode && user && activationStatus && !activationStatus.isActivated) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Settings className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-800 mb-2">DotSpark Activation Required</h3>
            <p className="text-gray-600 mb-4">
              Activate DotSpark to start creating and storing your personal cognitive maps with AI-powered insights.
            </p>
            <Button onClick={activateDotSpark} className="bg-amber-600 hover:bg-amber-700">
              Activate DotSpark
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Switch to Preview mode to explore the demonstration
            </p>
          </div>
        </div>
      );
    }

    // Use data from API calls which already route to correct endpoints
    const actualDots = dots;
    const displayWheels = userWheels;
    
    // Apply recent filter if enabled (only in real mode)
    let baseDotsToDisplay = actualDots;
    if (showingRecentFilter && !previewMode) {
      baseDotsToDisplay = [...baseDotsToDisplay]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, recentCount);
    }
    
    const displayDots = baseDotsToDisplay;
    const totalDots = displayDots.length;
    const totalWheels = displayWheels.filter((w: any) => w.chakraId !== undefined).length;
    const totalChakras = displayWheels.filter((w: any) => w.chakraId === undefined).length;

    // Auto-switch to real mode if user has content
    useEffect(() => {
      if (user && (userWheels.length > 0 || displayDots.length > 0)) {
        setPreviewMode(false);
      }
    }, [user, userWheels.length, displayDots.length]);

    return (
      <div className="space-y-6">
        {/* Recent Dots Section */}
        <div className="bg-white/95 backdrop-blur rounded-lg border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-800">
              {previewMode ? 'Preview Dots' : 'Recent Dots'}
            </h3>
            <div className="flex items-center gap-2">
              {!previewMode && (
                <span className="text-xs text-amber-600">
                  {showingRecentFilter ? `Showing ${recentCount} recent` : 'All dots'}
                </span>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {displayDots.length === 0 ? (
              <div className="text-center py-6">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-amber-700 font-medium mb-2">
                    {previewMode ? 'Preview Mode Active' : 'No dots found'}
                  </p>
                  <p className="text-amber-600 text-sm">
                    {previewMode 
                      ? 'Switch to real mode to view your personal dots'
                      : 'Create your first dot to see it here!'
                    }
                  </p>
                </div>
              </div>
            ) : (
              displayDots.slice(0, 10).map((dot) => (
                <DotCard 
                  key={dot.id} 
                  dot={dot} 
                  isPreview={previewMode}
                />
              ))
            )}
          </div>
        </div>

        {/* Grid Visualization */}
        <div className="bg-white/95 backdrop-blur rounded-lg border border-amber-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-800">
              {previewMode ? 'Preview Grid' : 'Dot Wheels Map'}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">
                {totalDots} Dots
              </span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                {totalWheels} Wheels
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                {totalChakras} Chakras
              </span>
            </div>
          </div>
          
          <div className="min-h-96 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100 p-4 relative overflow-hidden">
            {displayWheels.length === 0 && displayDots.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-amber-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-amber-800 mb-2">
                    {previewMode ? 'Preview Data Loading...' : 'Start Your Journey'}
                  </h4>
                  <p className="text-amber-600 text-sm">
                    {previewMode 
                      ? 'Demonstrating the DotSpark cognitive mapping system'
                      : 'Create your first dot to see it here!'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Chakras Section */}
                {displayWheels.filter(w => w.chakraId === undefined).length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-purple-800 mb-2">Chakras ({totalChakras})</h4>
                    <div className="grid gap-3">
                      {displayWheels
                        .filter(w => w.chakraId === undefined)
                        .map((chakra) => (
                          <Card 
                            key={chakra.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100"
                            onClick={() => setViewFullWheel(chakra)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-purple-800 text-sm">{chakra.heading}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-xs text-purple-700">{chakra.goals}</p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge className="bg-purple-200 text-purple-800 text-xs">
                                  Chakra
                                </Badge>
                                <span className="text-xs text-purple-600">{chakra.timeline}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}

                {/* Wheels Section */}
                {displayWheels.filter(w => w.chakraId !== undefined).length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-orange-800 mb-2">Wheels ({totalWheels})</h4>
                    <div className="grid gap-3">
                      {displayWheels
                        .filter(w => w.chakraId !== undefined)
                        .map((wheel) => (
                          <Card 
                            key={wheel.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100"
                            onClick={() => setViewFullWheel(wheel)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-orange-800 text-sm">{wheel.heading}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-xs text-orange-700">{wheel.goals}</p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge className="bg-orange-200 text-orange-800 text-xs">
                                  Wheel
                                </Badge>
                                <span className="text-xs text-orange-600">{wheel.timeline}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}

                {/* Scattered Dots Section */}
                {displayDots.filter(d => !d.wheelId || d.wheelId === '').length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-amber-800 mb-2">
                      Free Dots ({displayDots.filter(d => !d.wheelId || d.wheelId === '').length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {displayDots
                        .filter(d => !d.wheelId || d.wheelId === '')
                        .map((dot) => (
                          <div 
                            key={dot.id}
                            className="bg-amber-100 border border-amber-200 rounded-lg p-2 cursor-pointer hover:bg-amber-200 transition-colors"
                            onClick={() => setViewFullDot(dot)}
                          >
                            <div className="text-xs font-medium text-amber-800 truncate">
                              {dot.oneWordSummary}
                            </div>
                            <div className="text-xs text-amber-600 mt-1">
                              ✨ {dot.pulse}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
              <img 
                src="/dotspark-logo-icon.jpeg" 
                alt="DotSpark" 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Brain className="w-5 h-5 text-amber-500" />
                  My DotSpark Neura
                </h1>
              </div>
            </div>
          </div>

          {/* Right side - Stats and controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm hidden md:flex">
              <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                Total Dots: {gridData?.data?.statistics?.totalDots || dots.length}
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
                Total Wheels: {gridData?.data?.statistics?.totalWheels || userWheels.filter((w: any) => w.chakraId !== undefined).length}
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                Total Chakras: {gridData?.data?.statistics?.totalChakras || userWheels.filter((w: any) => w.chakraId === undefined).length}
              </div>
            </div>

            {/* Preview Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 ${
                previewMode 
                  ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' 
                  : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
              }`}
            >
              {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {previewMode ? 'Preview' : 'Real'}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
            <Input
              type="text"
              placeholder="Enter keywords to search for a Dot, Wheel, or Chakra"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500/20 bg-white/80"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {showSearchResults ? (
          /* Search Results */
          <div className="space-y-6">
            {searchResults.chakras.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                  Chakras ({searchResults.chakras.length})
                </h3>
                <div className="grid gap-3">
                  {searchResults.chakras.map((chakra) => (
                    <Card key={chakra.id} className="cursor-pointer hover:shadow-md transition-shadow border border-purple-200 bg-white/95 backdrop-blur" onClick={() => setViewFullWheel(chakra)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-purple-800">{chakra.heading}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{chakra.goals}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchResults.wheels.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  Wheels ({searchResults.wheels.length})
                </h3>
                <div className="grid gap-3">
                  {searchResults.wheels.map((wheel) => (
                    <Card key={wheel.id} className="cursor-pointer hover:shadow-md transition-shadow border border-orange-200 bg-white/95 backdrop-blur" onClick={() => setViewFullWheel(wheel)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-orange-800">{wheel.heading}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{wheel.goals}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchResults.dots.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">
                  Dots ({searchResults.dots.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.dots.map((dot) => (
                    <DotCard key={dot.id} dot={dot} isPreview={previewMode} />
                  ))}
                </div>
              </div>
            )}

            {searchResults.dots.length === 0 && searchResults.wheels.length === 0 && searchResults.chakras.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">No results found</h3>
                  <p className="text-amber-600">Try different keywords or check your spelling.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <DataDisplayComponent />
        )}

        {/* Dot Full View Modal */}
        {viewFullDot && (
          <DotFullView 
            dot={viewFullDot}
            isOpen={!!viewFullDot}
            onClose={() => setViewFullDot(null)}
            onDelete={async (dotId) => {
              try {
                await fetch(`/api/dots/${dotId}`, { method: 'DELETE' });
                setViewFullDot(null);
                window.location.reload();
              } catch (error) {
                console.error('Error deleting dot:', error);
              }
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
    </div>
  );
};

export default Dashboard;