import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, Settings, RotateCcw } from 'lucide-react';
import UserContentCreation from './UserContentCreation';
import { GlobalFloatingDot } from '@/components/dotspark/GlobalFloatingDot';
// Types will be inferred from API responses

// Import DotWheelsMap type to match Dashboard usage
interface DotWheelsMapProps {
  wheels: any[];
  dots: any[];
  showingRecentFilter?: boolean;
  recentCount?: number;
  isFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  setViewFullWheel: (wheel: any | null) => void;
  previewMode: boolean;
  setPreviewMode: (previewMode: boolean) => void;
}

// Create a simplified DotWheelsMap component that matches preview mode behavior
const DotWheelsMap: React.FC<DotWheelsMapProps & { onCreateDot?: () => void }> = ({ 
  wheels, 
  dots, 
  showingRecentFilter = false, 
  recentCount = 4,
  isFullscreen = false,
  onFullscreenChange,
  setViewFullWheel,
  previewMode,
  setPreviewMode,
  onCreateDot
}) => {
  const [zoom, setZoom] = useState(0.6);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const gridContainerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="space-y-4">
      {/* Grid Controls exactly like preview mode */}
      <div className="relative bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-xl border-2 border-amber-200 shadow-lg overflow-hidden">
        {/* Stats badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            {dots.length} Dots
          </Badge>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            {wheels.length} Wheels  
          </Badge>
          <Badge variant="secondary" className="bg-amber-200 text-amber-900 text-xs">
            0 Chakras
          </Badge>
        </div>

        {/* Create button */}
        {onCreateDot && (
          <div className="absolute top-4 right-4 z-20">
            <Button 
              onClick={onCreateDot}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs px-3 py-1 h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              Create
            </Button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/80 rounded-lg p-2">
          <Button 
            onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
          >
            -
          </Button>
          <span className="text-xs font-medium min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
          >
            +
          </Button>
        </div>

        {/* Interactive grid container */}
        <div 
          ref={gridContainerRef}
          className="relative h-[500px] w-full overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)` }}
        >
          {/* Render dots */}
          {dots.map((dot: any, index: number) => {
            const gridCols = Math.ceil(Math.sqrt(dots.length));
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            const x = 120 + (col * 150);
            const y = 120 + (row * 150);
            
            return (
              <div
                key={dot.id}
                className="absolute transition-all duration-300 hover:scale-110 cursor-pointer"
                style={{ 
                  left: `${x}px`, 
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="relative">
                  <div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg flex items-center justify-center border-2 border-white hover:shadow-xl transition-all duration-300"
                    title={`${dot.summary} - ${dot.pulse}`}
                  >
                    <span className="text-white font-bold text-xs text-center px-1">
                      {dot.oneWordSummary?.slice(0, 6) || dot.summary?.slice(0, 6) || 'Dot'}
                    </span>
                  </div>
                  
                  {/* Pulse indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${
                      dot.pulse === 'excited' ? 'bg-red-400' :
                      dot.pulse === 'curious' ? 'bg-blue-400' :
                      dot.pulse === 'focused' ? 'bg-purple-400' :
                      dot.pulse === 'happy' ? 'bg-yellow-400' :
                      dot.pulse === 'calm' ? 'bg-green-400' :
                      'bg-gray-400'
                    }`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface UserGridProps {
  userId?: number;
  mode: 'real' | 'preview';
}

const UserGrid: React.FC<UserGridProps> = ({ userId, mode }) => {
  const [showCreation, setShowCreation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showFloatingDot, setShowFloatingDot] = useState(false);
  
  // Add refs for grid controls
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user's dots
  const { data: userDots = [], isLoading: dotsLoading } = useQuery({
    queryKey: ['/api/user-content/dots'],
    enabled: mode === 'real' && !!userId
  });

  // Fetch user's wheels and chakras
  const { data: userWheels = [], isLoading: wheelsLoading } = useQuery({
    queryKey: ['/api/user-content/wheels'],
    enabled: mode === 'real' && !!userId
  });

  // Fetch user's statistics
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user-content/stats'],
    enabled: mode === 'real' && !!userId
  });

  const isLoading = dotsLoading || wheelsLoading || statsLoading;

  // Separate wheels and chakras
  const regularWheels = userWheels.filter((w: any) => w.chakraId !== null);
  const chakras = userWheels.filter((w: any) => w.chakraId === null);

  if (mode === 'preview') {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Preview Mode Active</h3>
        <p className="text-gray-600">
          This is demonstration data. Sign in and activate DotSpark to create your own content.
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Authentication Required</h3>
        <p className="text-gray-600">
          Please sign in to create and view your personal dots, wheels, and chakras.
        </p>
      </div>
    );
  }

  if (showCreation) {
    return (
      <UserContentCreation
        availableWheels={regularWheels}
        availableChakras={chakras}
        onSuccess={() => setShowCreation(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="ml-2 text-amber-800">Loading your content...</span>
      </div>
    );
  }

  const isEmpty = userDots.length === 0 && userWheels.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-amber-800 mb-2">Start Your DotSpark Journey</h3>
          <p className="text-gray-600 mb-6">
            Create your first dot, wheel, or chakra to begin organizing your thoughts and insights.
          </p>
          <Button 
            onClick={() => setShowCreation(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Chakras Section */}
      {chakras.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Your Chakras ({chakras.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chakras.map((chakra) => (
              <Card key={chakra.id} className="hover:shadow-lg transition-shadow border-amber-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-900 text-base">{chakra.name}</CardTitle>
                  {chakra.heading && (
                    <p className="text-sm text-gray-600">{chakra.heading}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {chakra.purpose && (
                    <p className="text-sm text-gray-700 mb-2">{chakra.purpose}</p>
                  )}
                  {chakra.timeline && (
                    <Badge variant="outline" className="text-xs">
                      {chakra.timeline}
                    </Badge>
                  )}
                  <div className="mt-3 flex justify-between items-center">
                    <Badge className="bg-amber-100 text-amber-800">
                      {chakra.category}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedItem(chakra)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Wheels Section */}
      {regularWheels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
            <RotateCcw className="w-5 h-5 mr-2" />
            Your Wheels ({regularWheels.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularWheels.map((wheel) => (
              <Card key={wheel.id} className="hover:shadow-lg transition-shadow border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-orange-800 text-base">{wheel.name}</CardTitle>
                  {wheel.heading && (
                    <p className="text-sm text-gray-600">{wheel.heading}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {wheel.goals && (
                    <p className="text-sm text-gray-700 mb-2">{wheel.goals}</p>
                  )}
                  {wheel.timeline && (
                    <Badge variant="outline" className="text-xs">
                      {wheel.timeline}
                    </Badge>
                  )}
                  <div className="mt-3 flex justify-between items-center">
                    <Badge className="bg-orange-100 text-orange-800">
                      {wheel.category}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedItem(wheel)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  {wheel.dots && wheel.dots.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {wheel.dots.length} dots
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Use DotWheelsMap component exactly like preview mode */}
      <DotWheelsMap 
        wheels={regularWheels}
        dots={userDots}
        showingRecentFilter={false}
        recentCount={4}
        isFullscreen={false}
        onFullscreenChange={() => {}}
        setViewFullWheel={() => {}}
        previewMode={false}
        setPreviewMode={() => {}}
        onCreateDot={() => setShowFloatingDot(true)}
      />

      {/* Item Detail Modal would go here */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedItem.name || selectedItem.summary}</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              {/* Display full details based on type */}
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Floating Dot Interface - Directly open expanded mode */}
      {showFloatingDot && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-amber-800">Create New Dot</h2>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFloatingDot(false)}
                  >
                    ✕
                  </Button>
                </div>
                <GlobalFloatingDot isActive={true} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserGrid;