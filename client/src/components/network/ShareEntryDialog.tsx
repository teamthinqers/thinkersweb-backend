import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Entry, Tag as TagType } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ShareEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  username: string;
}

type ShareMode = "single" | "byTag" | "all";

export default function ShareEntryDialog({
  isOpen,
  onClose,
  userId,
  username,
}: ShareEntryDialogProps) {
  const [shareMode, setShareMode] = useState<ShareMode>("single");
  const [selectedEntryId, setSelectedEntryId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const { toast } = useToast();

  // Fetch the current user's entries
  const { data: entries, isLoading: loadingEntries } = useQuery({
    queryKey: ["/api/entries"],
    queryFn: async () => {
      const response = await fetch("/api/entries");
      if (!response.ok) throw new Error("Failed to fetch entries");
      const data = await response.json();
      return data.entries || [];
    },
  });

  // Fetch all tags
  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ["/api/tags"],
    queryFn: async () => {
      const response = await fetch("/api/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      return response.json();
    },
  });

  // Share entry mutation
  const shareEntryMutation = useMutation({
    mutationFn: async () => {
      if (shareMode === "single" && !selectedEntryId) {
        throw new Error("No entry selected");
      }
      
      if (shareMode === "byTag" && selectedTagIds.length === 0) {
        throw new Error("No tags selected");
      }

      // Different API call depending on share mode
      const endpoint = shareMode === "single" 
        ? "/api/entries/share" 
        : shareMode === "byTag" 
          ? "/api/entries/share-by-tags" 
          : "/api/entries/share-all";
      
      const body = shareMode === "single" 
        ? { entryId: parseInt(selectedEntryId), sharedWithUserId: userId }
        : shareMode === "byTag"
          ? { tagIds: selectedTagIds, sharedWithUserId: userId }
          : { sharedWithUserId: userId };
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to share entries");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const count = data?.count || 1;
      const plural = count > 1 ? "entries" : "entry";
      
      toast({
        title: `${count} ${plural} shared`,
        description: `Your learning has been shared with ${username}`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to share entries",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prevSelected => 
      prevSelected.includes(tagId)
        ? prevSelected.filter(id => id !== tagId)
        : [...prevSelected, tagId]
    );
  };

  const handleShare = () => {
    if (shareMode === "single" && !selectedEntryId) {
      toast({
        title: "No entry selected",
        description: "Please select an entry to share",
        variant: "destructive",
      });
      return;
    }
    
    if (shareMode === "byTag" && selectedTagIds.length === 0) {
      toast({
        title: "No tags selected",
        description: "Please select at least one tag",
        variant: "destructive",
      });
      return;
    }
    
    shareEntryMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share Entries with {username}</DialogTitle>
          <DialogDescription>
            Share your learning entries with this connection.
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          value={shareMode} 
          onValueChange={(value) => setShareMode(value as ShareMode)}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Entry</TabsTrigger>
            <TabsTrigger value="byTag">By Tags</TabsTrigger>
            <TabsTrigger value="all">All Entries</TabsTrigger>
          </TabsList>
          
          {/* Single Entry Tab */}
          <TabsContent value="single" className="pt-4">
            <div className="grid gap-2">
              <Label htmlFor="entry">Select Entry</Label>
              {loadingEntries ? (
                <div className="flex items-center justify-center h-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <Select
                  value={selectedEntryId}
                  onValueChange={setSelectedEntryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an entry to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {entries?.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id.toString()}>
                        {entry.title} ({formatDate(entry.createdAt)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </TabsContent>
          
          {/* By Tags Tab */}
          <TabsContent value="byTag" className="pt-4">
            <div className="grid gap-2">
              <Label>Select Tags</Label>
              {loadingTags ? (
                <div className="flex items-center justify-center h-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 py-2">
                  {tags?.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer py-1 px-3"
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                      {tag.count && <span className="ml-1 opacity-70">({tag.count})</span>}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                All entries that include any of the selected tags will be shared.
              </p>
            </div>
          </TabsContent>
          
          {/* All Entries Tab */}
          <TabsContent value="all" className="pt-4">
            <div className="text-center py-6">
              <p>Share all your learning entries with {username}.</p>
              <p className="text-sm text-muted-foreground mt-2">
                This will give {username} access to view all your current and future entries.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={shareEntryMutation.isPending || 
              (shareMode === "single" && !selectedEntryId) ||
              (shareMode === "byTag" && selectedTagIds.length === 0)
            }
          >
            {shareEntryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Share {shareMode === "single" ? "Entry" : "Entries"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}