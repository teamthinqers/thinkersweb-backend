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
import ThoughtCloudGrid from "@/components/ThoughtCloudGrid";

export default function ThinQCirclePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/thinq-circle/:circleId");
  const { toast } = useToast();
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100">
      {/* Custom Toolbar */}
      <div className="sticky top-0 z-10 bg-yellow-400 shadow-[0_8px_30px_rgba(250,204,21,0.3)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and Circle name */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/mydotspark")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{circle.name}</h1>
                  {circle.description && (
                    <p className="text-sm text-white/80">{circle.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Stats and actions */}
            <div className="flex items-center gap-6">
              {/* Members avatars */}
              <div 
                onClick={() => setShowMembersModal(true)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex -space-x-2">
                  {displayMembers.map((member) => (
                    <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={member.user.linkedinPhotoUrl || member.user.avatar} />
                      <AvatarFallback className="bg-yellow-400 text-white text-xs">
                        {member.user.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-white font-medium">
                  {circle.stats.members}
                  {remainingCount > 0 && ` (+${remainingCount})`}
                </span>
              </div>

              {/* Dots count */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Lightbulb className="h-4 w-4 text-white" />
                <span className="text-white font-medium">{circle.stats.dots}</span>
              </div>

              {/* Sparks count */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Zap className="h-4 w-4 text-white" />
                <span className="text-white font-medium">{circle.stats.sparks}</span>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
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
        </div>
      </div>

      {/* Content Grid - TODO: Filter to show only circle thoughts */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-yellow-200 p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-700">
            <Shield className="h-5 w-5" />
            <p className="text-sm font-medium">
              Private Circle • Only members can see and contribute
            </p>
          </div>
        </div>

        {/* For now, show empty state. Will be replaced with filtered grid */}
        <div className="text-center py-20">
          <Lightbulb className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Share insights to this circle</h3>
          <p className="text-gray-600 mb-6">
            Members can share their dots, sparks, and perspectives here
          </p>
          <Button className="bg-yellow-400 hover:bg-yellow-500">
            Share from My Neura
          </Button>
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
                    <AvatarFallback className="bg-yellow-400 text-white">
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
    </div>
  );
}
