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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl shadow-xl" style={{ backgroundColor: '#F59E0B' }}>
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-amber-800">
                    My ThinQ Circles
                  </h1>
                  <p className="text-amber-700/70 text-lg mt-1">
                    Form your private ThinQ circles to brainstorm
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="text-white shadow-lg hover:opacity-90"
                style={{ backgroundColor: '#F59E0B' }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Circle
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-amber-700">Loading your circles...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && circles.length === 0 && (
            <Card className="border-amber-200 bg-gradient-to-br from-white to-amber-50">
              <CardContent className="py-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-4" style={{ color: '#F59E0B' }} />
                <h3 className="text-xl font-semibold text-amber-900 mb-2">No circles yet</h3>
                <p className="text-amber-700/70 mb-6">Create your first ThinQ Circle to start collaborating</p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: '#F59E0B' }}
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
                  className="border-amber-200 bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/thinq-circle/${circle.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Target className="h-5 w-5" style={{ color: '#F59E0B' }} />
                      {circle.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {circle.description && (
                      <p className="text-gray-600 mb-4">{circle.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-amber-700/70">
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
