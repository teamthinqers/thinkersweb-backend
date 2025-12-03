import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import SharedAuthLayout from '@/components/layout/SharedAuthLayout';
import { Button } from '@/components/ui/button';
import { Target, Users, ArrowLeft, Shield, Trash2 } from 'lucide-react';
import { CreateCircleModal } from '@/components/CreateCircleModal';
import { useAuth } from '@/hooks/use-auth-new';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const { user, authReady } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [circleToDelete, setCircleToDelete] = useState<Circle | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: circlesData, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ['/api/thinq-circles/my-circles'],
    enabled: !!user && authReady,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const circles = circlesData?.circles || [];

  // Delete circle mutation
  const deleteCircleMutation = useMutation({
    mutationFn: async (circleId: number) => {
      return apiRequest("DELETE", `/api/thinq-circles/${circleId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thinq-circles/my-circles'] });
      setCircleToDelete(null);
      toast({
        title: "Circle deleted",
        description: "The circle and all its data have been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
          {/* Privacy Notice - Above the box */}
          <div className="mb-4 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-200/60 p-3">
            <div className="flex items-center gap-2 text-amber-700">
              <Shield className="h-4 w-4" />
              <p className="text-sm font-medium">
                Only respective members of a circle can see and contribute
              </p>
            </div>
          </div>

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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">My ThinQ Circles</h2>
                <div className="flex flex-wrap gap-8 justify-center">
                  {circles.map((circle) => (
                    <div
                      key={circle.id}
                      className="group text-center transition-all duration-300 hover:scale-105 relative"
                    >
                      {/* Delete Icon - Only for circle owners */}
                      {user?.id === circle.ownerId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCircleToDelete(circle);
                          }}
                          className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Circle Element with Animated Pulsing Rings */}
                      <div 
                        onClick={() => setLocation(`/thinq-circle/${circle.id}`)}
                        className="relative w-32 h-32 cursor-pointer"
                      >
                        {/* Animated pulsing rings - outermost */}
                        <div className="absolute inset-0 rounded-full border-2 border-amber-400 opacity-30 animate-ping" 
                             style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-2 rounded-full border-2 border-amber-400 opacity-40 animate-pulse" 
                             style={{ animationDuration: '1.5s' }} />
                        
                        {/* Main circle with gradient and glow */}
                        <div 
                          className="absolute inset-0 rounded-full shadow-lg group-hover:shadow-2xl transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 group-hover:from-amber-500 group-hover:to-amber-700"
                          style={{ 
                            boxShadow: '0 0 20px rgba(245, 158, 11, 0.3), inset 0 -2px 10px rgba(0,0,0,0.1)'
                          }}
                        >
                          <div className="text-center relative z-10">
                            <Target className="h-8 w-8 text-white mx-auto mb-1 drop-shadow-md group-hover:scale-110 transition-transform" />
                            <div className="flex items-center justify-center gap-1 text-white drop-shadow">
                              <Users className="h-5 w-5" />
                              <span className="text-sm font-semibold">{circle.memberCount || 1}</span>
                            </div>
                          </div>
                          
                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!circleToDelete} onOpenChange={(open) => !open && setCircleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Circle?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? All the thoughts and data associated to your circle will be lost for you and circle members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => circleToDelete && deleteCircleMutation.mutate(circleToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Circle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SharedAuthLayout>
  );
}
