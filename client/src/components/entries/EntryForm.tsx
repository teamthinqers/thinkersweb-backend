import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, Bold, Italic, List, ListOrdered, Link as LinkIcon, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface EntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  entryId?: number | null;
}

const EntryForm: React.FC<EntryFormProps> = ({ isOpen, onClose, entryId }) => {
  const { toast } = useToast();
  const { categories } = useCategories();
  const { tags } = useTags();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For the entry being edited
  const { data: entryData, isLoading } = useQuery({
    queryKey: entryId ? [`/api/entries/${entryId}`] : null,
    enabled: !!entryId && isOpen
  });

  // Load entry data if editing
  useEffect(() => {
    if (entryData) {
      setTitle(entryData.title || "");
      setContent(entryData.content || "");
      setCategoryId(entryData.categoryId ? String(entryData.categoryId) : "");
      setIsFavorite(!!entryData.isFavorite);
      
      // Set selected tags if entry has tags
      if (entryData.tags && entryData.tags.length > 0) {
        setSelectedTagIds(entryData.tags.map((tag: any) => tag.id));
      } else {
        setSelectedTagIds([]);
      }
    }
  }, [entryData]);

  // Reset form when opened/closed
  useEffect(() => {
    if (!isOpen) {
      // Reset form if closed
      setTimeout(() => {
        setTitle("");
        setContent("");
        setCategoryId("");
        setTagInput("");
        setSelectedTagIds([]);
        setIsFavorite(false);
      }, 300);
    }
  }, [isOpen]);

  // Create new entry mutation
  const createEntry = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/entries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/frequency'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      
      toast({
        title: "Success",
        description: "Entry created successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create entry. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating entry:", error);
    }
  });

  // Update entry mutation
  const updateEntry = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/entries/${entryId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/frequency'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
      
      toast({
        title: "Success",
        description: "Entry updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update entry. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating entry:", error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = {
      title: title.trim(),
      content: content.trim(),
      categoryId: categoryId ? parseInt(categoryId) : null,
      isFavorite,
      tagIds: selectedTagIds,
    };
    
    try {
      if (entryId) {
        await updateEntry.mutateAsync(formData);
      } else {
        await createEntry.mutateAsync(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const tagExists = tags?.find(
      tag => tag.name.toLowerCase() === tagInput.toLowerCase()
    );
    
    if (tagExists) {
      // Add existing tag if not already selected
      if (!selectedTagIds.includes(tagExists.id)) {
        setSelectedTagIds([...selectedTagIds, tagExists.id]);
      }
    } else {
      // Create new tag
      const createNewTag = async () => {
        try {
          const res = await apiRequest("POST", "/api/tags", { name: tagInput.trim() });
          const newTag = await res.json();
          
          setSelectedTagIds([...selectedTagIds, newTag.id]);
          queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create tag",
            variant: "destructive",
          });
        }
      };
      
      createNewTag();
    }
    
    setTagInput("");
  };

  const removeTag = (tagId: number) => {
    setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
  };

  const handleTextFormat = (format: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = "";
    let cursorPos = 0;
    
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        cursorPos = start + 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        cursorPos = start + 1;
        break;
      case "ul":
        formattedText = `\n- ${selectedText}`;
        cursorPos = start + 3;
        break;
      case "ol":
        formattedText = `\n1. ${selectedText}`;
        cursorPos = start + 4;
        break;
      case "link":
        formattedText = `[${selectedText}](url)`;
        cursorPos = end + 2;
        break;
      case "image":
        formattedText = `![${selectedText}](url)`;
        cursorPos = end + 3;
        break;
      default:
        return;
    }
    
    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        // If text was selected, place cursor after the selection
        textarea.selectionStart = end + formattedText.length - selectedText.length;
        textarea.selectionEnd = end + formattedText.length - selectedText.length;
      } else {
        // If no text was selected, place cursor in appropriate position
        textarea.selectionStart = cursorPos;
        textarea.selectionEnd = cursorPos;
      }
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{entryId ? "Edit Learning Entry" : "New Learning Entry"}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What did you learn?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              
              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTagIds.map((tagId) => {
                    const tag = tags?.find((t) => t.id === tagId);
                    return (
                      <Badge 
                        key={tagId} 
                        variant="tag"
                        className="flex items-center gap-1"
                      >
                        {tag?.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tagId)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <div className="border border-gray-300 rounded-lg">
                <div className="flex border-b border-gray-300 p-1">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleTextFormat("bold")}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleTextFormat("italic")}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleTextFormat("ul")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleTextFormat("ol")}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleTextFormat("link")}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleTextFormat("image")}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Describe what you learned in detail..."
                  rows={8}
                  className="border-none focus:ring-0"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>
        
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : entryId ? "Update Entry" : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EntryForm;
