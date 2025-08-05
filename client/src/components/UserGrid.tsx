import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, Settings, RotateCcw } from 'lucide-react';
import UserContentCreation from './UserContentCreation';
// Types will be inferred from API responses

interface UserGridProps {
  userId?: number;
  mode: 'real' | 'preview';
}

const UserGrid: React.FC<UserGridProps> = ({ userId, mode }) => {
  const [showCreation, setShowCreation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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
      {/* Header with Statistics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-800">Your DotSpark Grid</h2>
          <p className="text-gray-600">Personal content stored with intelligence analysis</p>
        </div>
        
        <div className="flex items-center gap-4">
          {userStats && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {userStats.totalDots} Dots
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {userStats.totalWheels} Wheels
              </Badge>
              <Badge variant="secondary" className="bg-amber-200 text-amber-900">
                {userStats.totalChakras} Chakras
              </Badge>
            </div>
          )}
          
          <Button 
            onClick={() => setShowCreation(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

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

      {/* Visual Dots Grid - Same as Preview Mode */}
      {userDots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            Your Dots ({userDots.length})
          </h3>
          <div className="relative bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-xl border-2 border-amber-200 shadow-lg overflow-hidden min-h-[500px]">
            {/* Visual Grid Display */}
            <div className="relative w-full h-full p-8">
              {userDots.map((dot: any, index: number) => {
                // Calculate position for dots in a grid pattern
                const gridCols = Math.ceil(Math.sqrt(userDots.length));
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
                    onClick={() => setSelectedItem(dot)}
                  >
                    {/* Dot Circle */}
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
                    
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {dot.summary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default UserGrid;