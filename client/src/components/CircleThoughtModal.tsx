import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Lightbulb, Loader2 } from "lucide-react";

interface CircleThoughtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleId: number;
  circleName: string;
}

export function CircleThoughtModal({ open, onOpenChange, circleId, circleName }: CircleThoughtModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [heading, setHeading] = useState("");
  const [summary, setSummary] = useState("");
  const [emotions, setEmotions] = useState("");
  const [anchor, setAnchor] = useState("");

  const createAndShareMutation = useMutation({
    mutationFn: async (data: { heading: string; summary: string; emotions?: string; anchor?: string }) => {
      // Create and share thought to circle in one call
      return apiRequest("POST", `/api/thinq-circles/${circleId}/create-thought`, {
        ...data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Your thought has been shared to ${circleName}`,
      });

      // Invalidate queries to refresh
      queryClient.invalidateQueries({ queryKey: [`/api/thinq-circles/${circleId}/thoughts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/thinq-circles/${circleId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] });

      // Reset and close
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to share thought. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setHeading("");
    setSummary("");
    setEmotions("");
    setAnchor("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!heading.trim() || !summary.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the heading and summary",
        variant: "destructive",
      });
      return;
    }

    createAndShareMutation.mutate({
      heading: heading.trim(),
      summary: summary.trim(),
      emotions: emotions.trim() || undefined,
      anchor: anchor.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" style={{ color: '#F59E0B' }} />
            Share Thought to {circleName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heading">Heading *</Label>
            <Input
              id="heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Give your thought a title"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {summary.length}/500 characters
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emotions">Emotions (Optional)</Label>
            <Input
              id="emotions"
              value={emotions}
              onChange={(e) => setEmotions(e.target.value)}
              placeholder="e.g., Excited, Curious, Hopeful"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anchor">Memory Anchor (Optional)</Label>
            <Textarea
              id="anchor"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              placeholder="Context or trigger that helps you recall this thought"
              rows={2}
              maxLength={200}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Sharing to:</strong> {circleName} (Private Circle)
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={createAndShareMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAndShareMutation.isPending}
              className="hover:opacity-90"
              style={{ backgroundColor: '#F59E0B' }}
            >
              {createAndShareMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Share Thought
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
