import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, ArrowLeft, MoreHorizontal, UserPlus, Lightbulb, Zap, Settings, Shield, 
  Sparkles, MessageCircle, Send, RefreshCw, Trash2, Pencil, Share2, Bookmark
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { InviteToCircleModal } from "@/components/InviteToCircleModal";
import ThoughtCloudGrid from "@/components/ThoughtCloudGrid";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

export default function ThinQCirclePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/thinq-circle/:circleId");
  const { toast } = useToast();
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
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

  const queryClient = useQueryClient();

  // Delete thought mutation - allows all circle members to delete
  const deleteThoughtMutation = useMutation({
    mutationFn: async (thoughtId: number) => {
      return apiRequest("DELETE", `/api/thoughts/${thoughtId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thinq-circles/${circleId}/thoughts`] });
      setSelectedThought(null);
      toast({
        title: "Thought deleted",
        description: "The thought has been removed from the circle",
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

  // Save to MyNeura mutation
  const saveToMyNeuraMutation = useMutation({
    mutationFn: async (thoughtId: number) => {
      return apiRequest("POST", `/api/thoughts/myneura/save/${thoughtId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] });
      toast({
        title: "Saved to MyNeura!",
        description: "Thought has been added to your personal collection",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save to MyNeura",
        variant: "destructive",
      });
    },
  });

  // Share to Social mutation
  const shareToSocialMutation = useMutation({
    mutationFn: async (thoughtId: number) => {
      return apiRequest("POST", `/api/thoughts/myneura/share/${thoughtId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
      toast({
        title: "Shared to Social!",
        description: "Thought is now visible on the social feed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share to social",
        variant: "destructive",
      });
    },
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
          <Button onClick={() => setLocation("/thinq-circle")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Circles
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

          {/* Thought Cloud Canvas */}
          <div className={`relative w-full bg-gradient-to-br from-amber-50/70 to-orange-50/50 shadow-2xl border border-amber-200 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
            
            {/* Toolbar - Circle Navigation - hide in fullscreen */}
            {!isFullscreen && (
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
                {/* Left: Back button and stats */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocation("/thinq-circle")}
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

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

                {/* Right: Circle name, Member avatars and actions */}
                <div className="flex items-center gap-4">
                  {/* Circle Name */}
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" style={{ color: '#F59E0B' }} />
                    <span className="text-lg font-bold text-gray-900 tracking-tight">
                      {circle.name}
                    </span>
                  </div>
                  
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
              <ThoughtCloudGrid
                thoughts={thoughtsData.thoughts}
                isFullscreen={isFullscreen}
                onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                onDotClick={(thought) => setSelectedThought(thought)}
                patternId={`circle-${circleId}-pattern`}
                onRefresh={refetchThoughts}
              />
            ) : (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center space-y-4 max-w-md">
                  <Lightbulb className="h-16 w-16 mx-auto" style={{ color: '#F59E0B' }} />
                  <h3 className="text-xl font-semibold text-gray-800">No thoughts shared yet</h3>
                  <p className="text-gray-600">
                    Use the floating dot to create and share thoughts to this circle
                  </p>
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

      {/* Expanded Thought Modal - Three Column Layout (Same as MyNeura) */}
      <Dialog open={!!selectedThought} onOpenChange={(open) => !open && setSelectedThought(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 flex flex-col">
          {selectedThought && (
            <div className="grid grid-cols-3 flex-1 min-h-0">
              {/* Left Column: Thought Details */}
              <div className="flex flex-col h-full min-h-0 border-r border-gray-200">
                {/* Header */}
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
                  <DialogHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-amber-200">
                          <AvatarImage src={selectedThought.user?.linkedinPhotoUrl || selectedThought.user?.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            {selectedThought.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedThought.user?.fullName}</p>
                          <p className="text-sm text-gray-500">Shared to {circle.name}</p>
                        </div>
                      </div>
                      
                      {/* Action Menu - Available to all circle members */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            // TODO: Implement edit functionality
                            toast({
                              title: "Edit feature",
                              description: "Edit functionality coming soon",
                            });
                          }}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Thought
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteThoughtMutation.mutate(selectedThought.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Thought
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <DialogTitle className="text-2xl font-bold text-gray-900 mt-4">
                      {selectedThought.heading}
                    </DialogTitle>
                  </DialogHeader>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 min-h-0 overflow-y-scroll px-6 pt-6 pb-8">
                  <div className="space-y-6">
                    {/* Image - if present */}
                    {selectedThought.imageUrl && (
                      <div className="space-y-2">
                        <img 
                          src={selectedThought.imageUrl} 
                          alt={selectedThought.heading}
                          className="w-full max-h-96 object-cover rounded-lg shadow-lg"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                      <CardContent className="pt-6">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedThought.summary}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Additional Layers Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-amber-500">●</span>
                        Additional Layers
                      </h3>
                      
                      <div className="space-y-3">
                        {/* Emotions Tag Layer */}
                        <Card className="border-amber-200 bg-white/50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-24">
                                <p className="text-sm font-semibold text-gray-700">Emotions Tag</p>
                              </div>
                              <div className="flex-1 flex flex-wrap gap-2">
                                {selectedThought.emotions ? (() => {
                                  try {
                                    const emotionsArray = JSON.parse(selectedThought.emotions);
                                    return emotionsArray.length > 0 ? emotionsArray.map((emotion: string, idx: number) => (
                                      <Badge key={idx} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                        {emotion}
                                      </Badge>
                                    )) : <p className="text-sm text-gray-400 italic">No emotions added yet</p>;
                                  } catch {
                                    return <p className="text-sm text-gray-400 italic">No emotions added yet</p>;
                                  }
                                })() : (
                                  <p className="text-sm text-gray-400 italic">No emotions added yet</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Anchor Layer */}
                        <Card className="border-amber-200 bg-white/50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-24">
                                <p className="text-sm font-semibold text-gray-700">Anchor</p>
                              </div>
                              <div className="flex-1">
                                {selectedThought.anchor ? (
                                  <p className="text-sm text-gray-600">{selectedThought.anchor}</p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">No anchor added yet</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Analogies Layer */}
                        <Card className="border-amber-200 bg-white/50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-24">
                                <p className="text-sm font-semibold text-gray-700">Analogies</p>
                              </div>
                              <div className="flex-1">
                                {selectedThought.analogies ? (
                                  <p className="text-sm text-gray-600">{selectedThought.analogies}</p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">No analogies added yet</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Keywords Layer */}
                        <Card className="border-amber-200 bg-white/50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-24">
                                <p className="text-sm font-semibold text-gray-700">Keywords</p>
                              </div>
                              <div className="flex-1">
                                {selectedThought.keywords ? (
                                  <p className="text-sm text-gray-600">{selectedThought.keywords}</p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">No keywords added yet</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Share Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex flex-col gap-3">
                        <Button
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => shareToSocialMutation.mutate(selectedThought.id)}
                          disabled={shareToSocialMutation.isPending}
                        >
                          {shareToSocialMutation.isPending ? 'Sharing...' : 'Share to Social'}
                        </Button>
                        <Button
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => saveToMyNeuraMutation.mutate(selectedThought.id)}
                          disabled={saveToMyNeuraMutation.isPending}
                        >
                          {saveToMyNeuraMutation.isPending ? 'Saving...' : 'Share to MyNeura'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Circle Reflections (Personal Perspectives) */}
              <CircleReflections thoughtId={selectedThought.id} />

              {/* Right Column: Sparks */}
              <CircleSparks thoughtId={selectedThought.id} thought={selectedThought} user={user} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SharedAuthLayout>
  );
}

// Circle Reflections Component (reuses PersonalPerspectives pattern)
function CircleReflections({ thoughtId }: { thoughtId: number }) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch personal perspectives
  const { data: perspectivesData, isLoading } = useQuery<{
    success: boolean;
    threadId: number;
    messages: any[];
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/perspectives/personal`],
  });

  // Add perspective mutation
  const addPerspectiveMutation = useMutation({
    mutationFn: async (messageBody: string) => {
      return apiRequest("POST", `/api/thoughts/${thoughtId}/perspectives/personal`, { messageBody });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${thoughtId}/perspectives/personal`] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reflection",
        variant: "destructive",
      });
    },
  });

  // Delete perspective mutation
  const deletePerspectiveMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return apiRequest("DELETE", `/api/thoughts/${thoughtId}/perspectives/${messageId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${thoughtId}/perspectives/personal`] });
      toast({
        title: "Reflection deleted",
        description: "Your reflection has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete reflection",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    addPerspectiveMutation.mutate(message);
  };

  const messages = perspectivesData?.messages || [];

  return (
    <div className="flex flex-col h-full min-h-0 border-r border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Circle Reflections</h3>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading reflections...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No reflections yet</p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm border border-amber-100">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.user?.linkedinPhotoUrl || msg.user?.avatar} />
                  <AvatarFallback className="bg-amber-500 text-white text-xs">
                    {msg.user?.fullName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{msg.messageBody}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {msg.user?.id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deletePerspectiveMutation.mutate(msg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input - Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write your reflection..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || addPerspectiveMutation.isPending}
            className="bg-gradient-to-r from-amber-500 to-orange-500"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Circle Sparks Component (reuses SparksSection pattern)
function CircleSparks({ thoughtId, thought, user }: { thoughtId: number; thought: any; user: any }) {
  const [viewMode, setViewMode] = useState<'text' | 'visual'>('text');
  const [sparkNote, setSparkNote] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch evolved summary
  const { data: evolvedData, isLoading: evolvedLoading } = useQuery<{
    success: boolean;
    evolvedSummary: string;
    thoughtContext: any;
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/evolved-summary`],
  });

  // Fetch user sparks
  const { data: sparksData, isLoading: sparksLoading } = useQuery<{
    success: boolean;
    sparks: any[];
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/sparks`],
    enabled: !!thoughtId,
  });

  // Add spark mutation
  const addSparkMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/thoughts/${thoughtId}/sparks`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${thoughtId}/sparks`] });
      setSparkNote("");
      toast({
        title: "Spark saved!",
        description: "Your insight has been captured",
      });
    },
  });

  // Delete spark mutation
  const deleteSparkMutation = useMutation({
    mutationFn: async (sparkId: number) => {
      return apiRequest("DELETE", `/api/thoughts/${thoughtId}/sparks/${sparkId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${thoughtId}/sparks`] });
    },
  });

  const handleSaveSpark = () => {
    if (!sparkNote.trim()) return;
    addSparkMutation.mutate(sparkNote);
  };

  const userSparks = sparksData?.sparks || [];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Zap className="h-5 w-5 text-yellow-500" />
            <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Sparks</h3>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-gray-50 space-y-6">
        {/* Smart Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Smart Summary</h4>
            <div className="flex gap-1 bg-gray-100 rounded-md p-1">
              <Button
                variant={viewMode === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('text')}
                className="text-xs"
              >
                Text
              </Button>
              <Button
                variant={viewMode === 'visual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('visual')}
                className="text-xs"
              >
                Visual
              </Button>
            </div>
          </div>

          {evolvedLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-yellow-500" />
                <p className="text-xs text-gray-500">Generating evolved insight...</p>
              </div>
            </div>
          ) : viewMode === 'text' ? (
            <div className="h-[220px] flex flex-col justify-between">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200 flex-1 flex items-center overflow-y-auto">
                <p className="text-sm text-gray-800">{evolvedData?.evolvedSummary || 'No evolved thought yet. Add reflections to generate insights!'}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-lg p-6 h-[220px] flex items-center justify-center">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-800 mb-2">Visual Summary</p>
                <p className="text-xs text-gray-600 max-w-[250px]">{evolvedData?.evolvedSummary || 'Coming soon!'}</p>
              </div>
            </div>
          )}
        </div>

        {/* My Sparks */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">My Sparks ({userSparks.length})</h4>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {sparksLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto text-gray-400" />
              </div>
            ) : userSparks.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No sparks saved yet</p>
            ) : (
              userSparks.map((spark: any) => (
                <div key={spark.id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 group relative">
                  <p className="text-sm text-gray-800 pr-6">{spark.content}</p>
                  {user && spark.userId === user.id && (
                    <button
                      onClick={() => {
                        if (confirm('Delete this spark?')) {
                          deleteSparkMutation.mutate(spark.id);
                        }
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      disabled={deleteSparkMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{new Date(spark.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Input - Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={sparkNote}
            onChange={(e) => setSparkNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveSpark()}
            placeholder="Capture your spark..."
            className="flex-1"
          />
          <Button
            onClick={handleSaveSpark}
            disabled={!sparkNote.trim() || addSparkMutation.isPending}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
