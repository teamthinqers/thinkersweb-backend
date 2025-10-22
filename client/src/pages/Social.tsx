import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, ArrowLeft, Sparkles, ExternalLink, User, Linkedin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Thought = {
  id: number;
  heading: string;
  summary: string;
  contributorType: string;
  guestName?: string;
  guestLinkedInUrl?: string;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
    avatar?: string;
    linkedinPhotoUrl?: string;
    linkedinProfileUrl?: string;
    email: string;
  };
};

export default function Social() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [editHeading, setEditHeading] = useState("");
  const [editSummary, setEditSummary] = useState("");

  const { data: thoughtsData, isLoading } = useQuery<{ thoughts: Thought[] }>({
    queryKey: ['/api/thoughts'],
  });

  const { data: userData } = useQuery<{ user: { email: string } }>({
    queryKey: ['/api/user'],
  });

  const thoughts = thoughtsData?.thoughts || [];
  const isAdmin = userData?.user?.email === 'aravindhraj1410@gmail.com';

  const handleBack = () => {
    const fromDotInterface = localStorage.getItem('dotSocialNavigation');
    if (fromDotInterface === 'true') {
      localStorage.removeItem('dotSocialNavigation');
      setLocation('/dot');
    } else {
      window.history.back();
    }
  };

  const handleAvatarClick = (thought: Thought) => {
    // If guest with LinkedIn, open LinkedIn profile
    if (thought.contributorType === 'guest' && thought.guestLinkedInUrl) {
      window.open(thought.guestLinkedInUrl, '_blank');
    }
    // If registered user with LinkedIn, open their LinkedIn profile
    else if (thought.user?.linkedinProfileUrl) {
      window.open(thought.user.linkedinProfileUrl, '_blank');
    }
  };

  const getContributorName = (thought: Thought) => {
    if (thought.contributorType === 'guest') {
      return thought.guestName || 'Guest Contributor';
    }
    return thought.user?.fullName || 'Anonymous';
  };

  const getContributorAvatar = (thought: Thought) => {
    if (thought.contributorType === 'guest') {
      return undefined; // No avatar for guests
    }
    return thought.user?.linkedinPhotoUrl || thought.user?.avatar;
  };

  const getContributorInitials = (thought: Thought) => {
    const name = getContributorName(thought);
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasLinkedIn = (thought: Thought) => {
    if (thought.contributorType === 'guest') {
      return !!thought.guestLinkedInUrl;
    }
    return !!thought.user?.linkedinProfileUrl;
  };

  // Admin mutations
  const editMutation = useMutation({
    mutationFn: async ({ id, heading, summary }: { id: number; heading: string; summary: string }) => {
      return await apiRequest('PATCH', `/api/thoughts/${id}`, { heading, summary });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      toast({
        title: "Success",
        description: "Thought updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedThought(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update thought",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/thoughts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      toast({
        title: "Success",
        description: "Thought deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedThought(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete thought",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (thought: Thought) => {
    setSelectedThought(thought);
    setEditHeading(thought.heading);
    setEditSummary(thought.summary);
    setEditDialogOpen(true);
  };

  const handleDelete = (thought: Thought) => {
    setSelectedThought(thought);
    setDeleteDialogOpen(true);
  };

  const confirmEdit = () => {
    if (selectedThought) {
      editMutation.mutate({
        id: selectedThought.id,
        heading: editHeading,
        summary: editSummary,
      });
    }
  };

  const confirmDelete = () => {
    if (selectedThought) {
      deleteMutation.mutate(selectedThought.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="relative text-center mb-8">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="absolute left-0 top-0 flex items-center gap-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-10 w-10 text-amber-600 animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Social Neura
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            A collective intelligence network where thoughts spark insights
          </p>

          {/* Contribute Button */}
          <Button
            onClick={() => setLocation('/guest-contribute')}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Share Your Thought
          </Button>
        </div>

        {/* Thoughts Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading thoughts...</p>
            </div>
          ) : thoughts.length === 0 ? (
            <Card className="border-2 border-dashed border-amber-300">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No thoughts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share an insight with the community!
                </p>
                <Button
                  onClick={() => setLocation('/guest-contribute')}
                  className="bg-gradient-to-r from-amber-600 to-orange-600"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Share First Thought
                </Button>
              </CardContent>
            </Card>
          ) : (
            thoughts.map((thought) => (
              <Card key={thought.id} className="border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div 
                      className={`flex-shrink-0 ${hasLinkedIn(thought) ? 'cursor-pointer group' : ''}`}
                      onClick={() => hasLinkedIn(thought) && handleAvatarClick(thought)}
                      title={hasLinkedIn(thought) ? "View LinkedIn Profile" : undefined}
                    >
                      <div className="relative">
                        <Avatar className={`h-12 w-12 border-2 border-amber-300 ${hasLinkedIn(thought) ? 'group-hover:border-blue-500 transition-colors' : ''}`}>
                          <AvatarImage src={getContributorAvatar(thought)} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 font-semibold">
                            {getContributorInitials(thought)}
                          </AvatarFallback>
                        </Avatar>
                        {hasLinkedIn(thought) && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 group-hover:bg-blue-700 transition-colors">
                            <Linkedin className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contributor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {getContributorName(thought)}
                        </h3>
                        {thought.contributorType === 'guest' && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-medium">
                            Guest Contributor
                          </span>
                        )}
                        {hasLinkedIn(thought) && (
                          <button
                            onClick={() => handleAvatarClick(thought)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="View LinkedIn Profile"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(thought.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(thought)}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Edit thought"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(thought)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete thought"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                    {thought.heading}
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {thought.summary}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer CTA */}
        {thoughts.length > 0 && (
          <div className="mt-12 text-center bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 border-2 border-amber-200/50">
            <h3 className="text-2xl font-bold text-amber-800 mb-3">
              Join the Conversation
            </h3>
            <p className="text-amber-700 mb-6 max-w-xl mx-auto">
              Share your insights and perspectives with the DotSpark community
            </p>
            <Button
              onClick={() => setLocation('/guest-contribute')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Contribute Your Thought
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Thought</DialogTitle>
            <DialogDescription>
              Make changes to the thought. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="heading">Heading</Label>
              <Input
                id="heading"
                value={editHeading}
                onChange={(e) => setEditHeading(e.target.value)}
                placeholder="Thought heading"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Thought</Label>
              <Textarea
                id="summary"
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                placeholder="Thought content"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={editMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-orange-600"
            >
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the thought
              "{selectedThought?.heading}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
