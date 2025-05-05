import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { Edit, X, Star, Share2, ArrowLeft, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EntryDetailProps {
  entryId: number;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number) => void;
}

const EntryDetail: React.FC<EntryDetailProps> = ({ 
  entryId, 
  isOpen, 
  onClose, 
  onEdit 
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: entry, isLoading, error } = useQuery({
    queryKey: [`/api/entries/${entryId}`]
  });

  // Toggle favorite mutation
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/entries/${entryId}/favorite`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      toast({
        title: entry?.isFavorite ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
    }
  });

  const handleToggleFavorite = () => {
    toggleFavorite.mutate();
  };

  const handleShare = () => {
    toast({
      title: "Share",
      description: "Sharing functionality coming soon!",
      duration: 3000,
    });
  };

  // Convert markdown to HTML (basic implementation)
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return "";
    
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-accent underline">$1</a>')
      // Paragraphs
      .replace(/^\s*(\n)?(.+)/gm, function(m) {
        return /\<(\/)?(h|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
      })
      // Line breaks
      .replace(/\n/g, '<br>');
    
    // Fix lists
    html = html
      .replace(/<li>(.+)<\/li>/g, function(m) {
        return m;
      })
      .replace(/(<li>.*<\/li>)(?!<li>)/g, '<ul>$1</ul>');
    
    return html;
  };

  const getCategoryColor = () => {
    if (!entry?.category) return "#6366f1"; // Default primary color
    
    if (!entry.category.color) {
      const category = entry.category.name.toLowerCase();
      if (category === "professional") return "#6366f1";
      if (category === "personal") return "#8b5cf6";
      if (category === "health") return "#10b981";
      if (category === "finance") return "#f59e0b";
    }
    
    return entry.category.color;
  };

  const getCategoryVariant = () => {
    if (!entry?.category) return "default";
    
    const category = entry.category.name.toLowerCase();
    if (category === "professional") return "professional";
    if (category === "personal") return "personal";
    if (category === "health") return "health";
    if (category === "finance") return "finance";
    
    return "default";
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex justify-between items-center p-4">
            <div>Loading...</div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !entry) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex justify-between items-center p-4">
            <div>Error loading entry</div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Formatted date for display
  const formattedDate = entry.createdAt 
    ? format(new Date(entry.createdAt), "MMM d, yyyy")
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {entry.category && (
              <Badge 
                variant={getCategoryVariant()}
                style={{ 
                  backgroundColor: `${getCategoryColor()}10`, 
                  color: getCategoryColor() 
                }}
                className="capitalize"
              >
                {entry.category.name}
              </Badge>
            )}
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(entry.id)}
              className="mr-1"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-2xl font-bold mb-4">{entry.title}</h2>
          
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content) }} />
          </div>
          
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="tag">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {entry.relatedEntries && entry.relatedEntries.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Related Entries</h4>
              <div className="space-y-2">
                {entry.relatedEntries.map((relatedEntry: any) => (
                  <div 
                    key={relatedEntry.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      onClose();
                      setTimeout(() => onEdit(relatedEntry.id), 100);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{relatedEntry.title}</span>
                      <span className="text-xs text-gray-500">
                        {relatedEntry.createdAt
                          ? format(new Date(relatedEntry.createdAt), "MMM d, yyyy")
                          : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <Button variant="outline" className="flex items-center" disabled>
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous entry
          </Button>
          <div>
            <Button 
              variant="outline" 
              size="icon" 
              className="mr-2"
              onClick={handleToggleFavorite}
            >
              <Star 
                className={`h-4 w-4 ${entry.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
              />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" className="flex items-center" disabled>
            Next entry <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntryDetail;
