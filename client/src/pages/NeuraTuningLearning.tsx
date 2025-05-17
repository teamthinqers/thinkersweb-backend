import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Lightbulb, ChevronLeft, Save, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function NeuraTuningLearning() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // DotSpark Tuning hook
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateLearningFocus,
    isUpdatingFocus
  } = useDotSparkTuning();
  
  // State for new focus area input
  const [newFocus, setNewFocus] = useState('');
  
  // Local state for tracking changes
  const [pendingFocusAreas, setPendingFocusAreas] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      learningFocus: []
    }
  };
  
  // Initialize pending focus areas from current data
  React.useEffect(() => {
    if (neuralTuning?.learningFocus && !hasChanges) {
      setPendingFocusAreas([...neuralTuning.learningFocus]);
    }
  }, [neuralTuning?.learningFocus, hasChanges]);
  
  // Function to add a new focus area
  const handleAddFocus = () => {
    if (!newFocus.trim()) return;
    
    setPendingFocusAreas(prev => [...prev, newFocus.trim()]);
    setNewFocus('');
    setHasChanges(true);
  };
  
  // Function to remove a focus area
  const handleRemoveFocus = (index: number) => {
    setPendingFocusAreas(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setHasChanges(true);
  };
  
  // Save changes to learning focus
  const saveChanges = async () => {
    if (!hasChanges) {
      toast({
        title: "No Changes",
        description: "No changes to save.",
        variant: "default",
      });
      return;
    }
    
    try {
      await updateLearningFocus(pendingFocusAreas);
      setHasChanges(false);
      
      toast({
        title: "Changes Saved",
        description: "Your learning focus directives have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating learning focus:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your learning focus directives.",
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (isTuningLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation('/my-neura')} className="p-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Learning Engine</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading learning focus parameters...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/my-neura')} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Learning Engine</h1>
        </div>
        {hasChanges && (
          <Button 
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            onClick={saveChanges}
            disabled={isUpdatingFocus}
          >
            {isUpdatingFocus ? (
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>
        )}
      </div>
      
      {/* Learning Engine Section Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
              <Lightbulb className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle>Learning Engine</CardTitle>
              <CardDescription>
                Guide what your neural extension should prioritize learning
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Define specific areas or topics you want your neural extension to learn more about and prioritize in conversations.
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newFocus}
                onChange={(e) => setNewFocus(e.target.value)}
                placeholder="Enter a new learning focus area"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddFocus();
                  }
                }}
              />
              <Button 
                onClick={handleAddFocus}
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!newFocus.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 min-h-[200px]">
              <h3 className="text-lg font-medium mb-4">Current Learning Directives</h3>
              
              {pendingFocusAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pendingFocusAreas.map((focus, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="py-2 px-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      {focus}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                        onClick={() => handleRemoveFocus(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[120px] border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">No learning directives added yet</p>
                  <p className="text-xs text-muted-foreground">Add topics above that you want your neural extension to focus on</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900">
              <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">How Learning Engine Works</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Learning directives tell your neural extension which topics to pay special attention to. It will actively improve its understanding of these areas and give them priority when answering questions or providing insights.
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/50 dark:to-green-950/50 border-t px-6 py-4 justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/my-neura')}
          >
            Back to My Neura
          </Button>
          
          <Button 
            variant="default"
            onClick={saveChanges}
            disabled={!hasChanges || isUpdatingFocus}
            className={hasChanges ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {isUpdatingFocus ? (
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4 mr-1" />
                {hasChanges ? "Save Changes" : "No Changes"}
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}