import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import SharedAuthLayout from '@/components/layout/SharedAuthLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Users, Plus, Clock } from 'lucide-react';
import { CreateCircleModal } from '@/components/CreateCircleModal';
import { useAuth } from '@/hooks/use-auth-new';

interface Circle {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  ownerId: number;
  memberCount: number;
}

export default function ThoughtCirclePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: circlesData, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ['/api/thinq-circles/my-circles'],
    enabled: !!user,
  });

  const circles = circlesData?.circles || [];

  return (
    <SharedAuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                    My ThinQ Circles
                  </h1>
                  <p className="text-purple-700/70 text-lg mt-1">
                    Form your private ThinQ circles to brainstorm
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Circle
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-purple-600">Loading your circles...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && circles.length === 0 && (
            <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <CardContent className="py-12 text-center">
                <Target className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-900 mb-2">No circles yet</h3>
                <p className="text-purple-700/70 mb-6">Create your first ThinQ Circle to start collaborating</p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Circle
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Circles Grid */}
          {!isLoading && circles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {circles.map((circle) => (
                <Card 
                  key={circle.id}
                  className="border-purple-200 bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/thinq-circle/${circle.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <Target className="h-5 w-5 text-purple-600" />
                      {circle.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {circle.description && (
                      <p className="text-gray-600 mb-4">{circle.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-purple-700/70">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{circle.memberCount || 1} member{circle.memberCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(circle.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCircleModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </SharedAuthLayout>
  );
}
