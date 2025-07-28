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
      <div className="space-y-6">
        {/* Preview explanation */}
        <div className="text-center py-4">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Preview Mode - Demonstration Data</h3>
          <p className="text-gray-600 text-sm">
            Explore how DotSpark organizes thoughts into structured insights
          </p>
        </div>
        
        {/* Show preview stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">26</div>
              <div className="text-sm text-gray-600">Preview Dots</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">5</div>
              <div className="text-sm text-gray-600">Preview Wheels</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">2</div>
              <div className="text-sm text-gray-600">Preview Chakras</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Show sample dots */}
        <div>
          <h4 className="text-lg font-semibold text-amber-800 mb-3">Sample Dots</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Microservices", summary: "Architecture patterns for distributed systems", pulse: "curious" },
              { title: "React Patterns", summary: "Advanced component composition techniques", pulse: "focused" },
              { title: "Team Leadership", summary: "Effective communication strategies", pulse: "confident" }
            ].map((dot, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit text-xs">{dot.pulse}</Badge>
                  <CardTitle className="text-sm">{dot.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600">{dot.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="text-center py-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-700 mb-2">
            Ready to create your own structured insights?
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Sign In to Start Creating
          </Button>
        </div>
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

      {/* Dots Section */}
      {userDots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-amber-700 mb-4 flex items-center">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 mr-2"></div>
            Your Dots ({userDots.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDots.map((dot: any) => (
              <Card key={dot.id} className="hover:shadow-lg transition-shadow border-amber-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-800 text-sm leading-relaxed">
                    {dot.summary}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-2">{dot.anchor}</p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700"
                    >
                      {dot.pulse}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedItem(dot)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        dot.sourceType === 'voice' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {dot.sourceType}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        dot.captureMode === 'ai' 
                          ? 'bg-purple-50 text-purple-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {dot.captureMode}
                    </Badge>
                  </div>
                  {dot.wheel && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        in {dot.wheel.name}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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