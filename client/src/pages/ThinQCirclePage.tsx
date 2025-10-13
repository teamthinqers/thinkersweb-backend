import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, ArrowLeft, MoreHorizontal, UserPlus, Lightbulb, Zap, Settings, Shield
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { InviteToCircleModal } from "@/components/InviteToCircleModal";
import { CircleThoughtModal } from "@/components/CircleThoughtModal";
import ThoughtCloudGrid from "@/components/ThoughtCloudGrid";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";

export default function ThinQCirclePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/thinq-circle/:circleId");
  const { toast } = useToast();
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateThoughtModal, setShowCreateThoughtModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedThought, setSelectedThought] = useState<any>(null);

  const circleId = params?.circleId ? parseInt(params.circleId) : null;

  // Fetch circle details
  const { data: circleData, isLoading } = useQuery<{
    success: boolean;
    circle: {
      id: number;
      name: string;
      description?: string;
      createdBy: number;
      members: Array<{
        id: number;
        userId: number;
        role: string;
        user: {
          id: number;
          fullName: string;
          email: string;
          avatar?: string;
          linkedinPhotoUrl?: string;
        };
      }>;
      stats: {
        dots: number;
        sparks: number;
        members: number;
      };
    };
  }>({
    queryKey: [`/api/thinq-circles/${circleId}`],
    enabled: !!circleId && !!user,
  });

  // Fetch circle thoughts
  const { data: thoughtsData, isLoading: thoughtsLoading, refetch: refetchThoughts } = useQuery<{
    thoughts: any[];
  }>({
    queryKey: [`/api/thinq-circles/${circleId}/thoughts`],
    enabled: !!circleId && !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#F59E0B', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600">Loading circle...</p>
        </div>
      </div>
    );
  }

  if (!circleData?.circle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Circle not found</h2>
          <p className="text-gray-600 mb-6">This circle may have been deleted or you don't have access.</p>
          <Button onClick={() => setLocation("/mydotspark")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const circle = circleData.circle;
  const currentUserMembership = circle.members.find(m => m.userId === user?.id);
  const isOwner = currentUserMembership?.role === 'owner';
  
  // Show first 3 members in toolbar
  const displayMembers = circle.members.slice(0, 3);
  const remainingCount = circle.members.length - displayMembers.length;

  return (
    <SharedAuthLayout>
      <div className={`flex-1 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          
          {/* Universal Private Notice - Outside Grid */}
          {!isFullscreen && (
            <div className="mb-4 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-200/60 p-3">
              <div className="flex items-center gap-2 text-amber-700">
                <Shield className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Only respective members of a circle can see and contribute
                </p>
              </div>
            </div>
          )}

          {/* Thought Cloud Canvas */}
          <div className={`relative w-full bg-gradient-to-br from-amber-50/70 to-orange-50/50 shadow-2xl border border-amber-200 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
            
            {/* Toolbar - Circle Navigation - hide in fullscreen */}
            {!isFullscreen && (
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
                {/* Left: Back button and Circle info */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocation("/mydotspark")}
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  {/* Circle Name and Members Count */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-l-2 border-amber-500 transition-all duration-300 relative"
                    >
                      <Users className="h-4 w-4" style={{ color: '#F59E0B' }} />
                      <span className="text-sm font-semibold" style={{ color: '#F59E0B' }}>
                        {circle.name}
                      </span>
                    </Button>
                  </div>

                  {/* Dots count */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-l-2 border-orange-500 transition-all duration-300 relative"
                      title="Dots"
                    >
                      <Lightbulb className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-orange-700">
                        Dots
                      </span>
                    </Button>
                    <div className="px-2.5 py-1 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50">
                      <span className="text-xs font-semibold text-orange-800">{circle.stats.dots}</span>
                    </div>
                  </div>

                  {/* Sparks count */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border-l-2 border-yellow-500 transition-all duration-300 relative"
                      title="Sparks"
                    >
                      <Zap className="h-4 w-4 text-yellow-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-yellow-700">
                        Sparks
                      </span>
                    </Button>
                    <div className="px-2.5 py-1 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200/50">
                      <span className="text-xs font-semibold text-yellow-800">{circle.stats.sparks}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Member avatars and actions */}
                <div className="flex items-center gap-4">
                  {/* Members avatars */}
                  <div 
                    onClick={() => setShowMembersModal(true)}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-white/70 px-3 py-2 rounded-xl border border-gray-200"
                  >
                    <div className="flex -space-x-2">
                      {displayMembers.map((member) => (
                        <Avatar key={member.id} className="h-7 w-7 border-2 border-white">
                          <AvatarImage src={member.user.linkedinPhotoUrl || member.user.avatar} />
                          <AvatarFallback className="text-white text-xs" style={{ backgroundColor: '#F59E0B' }}>
                            {member.user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {circle.stats.members}
                    </span>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-700 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowMembersModal(true)}>
                        <Users className="h-4 w-4 mr-2" />
                        View Members
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Members
                      </DropdownMenuItem>
                      {isOwner && (
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Circle Settings
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Thoughts Display */}
            {thoughtsLoading ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#F59E0B', borderTopColor: 'transparent' }}></div>
                  <p className="text-gray-600">Loading circle thoughts...</p>
                </div>
              </div>
            ) : (thoughtsData?.thoughts && thoughtsData.thoughts.length > 0) ? (
              <>
                <ThoughtCloudGrid
                  thoughts={thoughtsData.thoughts}
                  isFullscreen={isFullscreen}
                  onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                  onDotClick={(thought) => setSelectedThought(thought)}
                  patternId={`circle-${circleId}-pattern`}
                  onRefresh={refetchThoughts}
                />
                
                {/* Floating Action Button to create thoughts */}
                <Button
                  onClick={() => setShowCreateThoughtModal(true)}
                  className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                  style={{ backgroundColor: '#F59E0B' }}
                  size="icon"
                >
                  <Lightbulb className="h-6 w-6 text-white" />
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center space-y-4 max-w-md">
                  <Lightbulb className="h-16 w-16 mx-auto" style={{ color: '#F59E0B' }} />
                  <h3 className="text-xl font-semibold text-gray-800">Share insights to this circle</h3>
                  <p className="text-gray-600">
                    Members can share their dots, sparks, and perspectives here
                  </p>
                  <Button 
                    onClick={() => setShowCreateThoughtModal(true)}
                    className="hover:opacity-90" 
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Create Thought
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members Modal */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Circle Members ({circle.members.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {circle.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user.linkedinPhotoUrl || member.user.avatar} />
                    <AvatarFallback className="text-white" style={{ backgroundColor: '#F59E0B' }}>
                      {member.user.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{member.user.fullName}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                  {isOwner && member.userId !== user?.id && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <InviteToCircleModal 
        open={showInviteModal} 
        onOpenChange={setShowInviteModal}
        circleId={circleId!}
        circleName={circle.name}
      />

      {/* Create Thought Modal */}
      <CircleThoughtModal 
        open={showCreateThoughtModal} 
        onOpenChange={setShowCreateThoughtModal}
        circleId={circleId!}
        circleName={circle.name}
      />
    </SharedAuthLayout>
  );
}
