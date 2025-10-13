import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import SharedAuthLayout from '@/components/layout/SharedAuthLayout';
import { Button } from '@/components/ui/button';
import { Target, Users, ArrowLeft } from 'lucide-react';
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
              <Target className="h-6 w-6 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white">My ThinQ Circles</h1>
                <p className="text-sm text-white/90"><strong>Form your private circles to brainstorm</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#F59E0B', borderTopColor: 'transparent' }}></div>
              <p className="text-gray-600">Loading your circles...</p>
            </div>
          )}

          {/* Empty State - Learning Engine Style */}
          {!isLoading && circles.length === 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8">
              <div className="text-center space-y-6">
                <div className="inline-flex p-4 rounded-full shadow-[0_8px_30px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#F59E0B' }}>
                  <Target className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                  ThinQ Circles
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Create private brainstorming circles with trusted peers. Share insights, collaborate on ideas, and build collective intelligence together.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="p-6 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#F59E0B' }}>
                    <h3 className="font-semibold text-white mb-2">Private Groups</h3>
                    <p className="text-sm text-white/90">Invite-only circles for focused collaboration</p>
                  </div>
                  <div className="p-6 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#F59E0B' }}>
                    <h3 className="font-semibold text-white mb-2">Share Insights</h3>
                    <p className="text-sm text-white/90">Exchange thoughts and perspectives</p>
                  </div>
                  <div className="p-6 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)]" style={{ backgroundColor: '#F59E0B' }}>
                    <h3 className="font-semibold text-white mb-2">Build Together</h3>
                    <p className="text-sm text-white/90">Collective brainstorming and growth</p>
                  </div>
                </div>

                <div className="pt-8">
                  <Button 
                    size="lg"
                    onClick={() => setShowCreateModal(true)}
                    className="text-white px-8 py-6 text-lg shadow-[0_8px_30px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)] hover:opacity-90"
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    Create Your First Circle
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Circles Display - As Circular Elements */}
          {!isLoading && circles.length > 0 && (
            <div className="space-y-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Circles</h2>
                <div className="flex flex-wrap gap-8 justify-center">
                  {circles.map((circle) => (
                    <div
                      key={circle.id}
                      onClick={() => setLocation(`/thinq-circle/${circle.id}`)}
                      className="group cursor-pointer text-center transition-all duration-300 hover:scale-105"
                    >
                      {/* Circle Element */}
                      <div 
                        className="relative w-32 h-32 rounded-full shadow-lg group-hover:shadow-xl transition-shadow flex items-center justify-center"
                        style={{ backgroundColor: '#F59E0B' }}
                      >
                        <div className="text-center">
                          <Target className="h-8 w-8 text-white mx-auto mb-1" />
                          <div className="flex items-center justify-center gap-1 text-white">
                            <Users className="h-5 w-5" />
                            <span className="text-sm font-semibold">{circle.memberCount || 1}</span>
                          </div>
                        </div>
                      </div>
                      {/* Circle Name */}
                      <p className="mt-3 font-semibold text-gray-800 max-w-[140px] truncate">{circle.name}</p>
                      {circle.description && (
                        <p className="text-xs text-gray-500 max-w-[140px] truncate">{circle.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="text-white shadow-lg hover:opacity-90"
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Create New Circle
                  </Button>
                </div>
              </div>
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
