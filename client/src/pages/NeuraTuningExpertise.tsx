import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Target, ChevronLeft, Save, Info, Plus, Trash2, Check } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function NeuraTuningExpertise() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // DotSpark Tuning hook
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateTuning,
    isUpdating
  } = useDotSparkTuning();
  
  // Define functional domains
  const functionalDomains = [
    { id: 'business_strategy', name: 'Business & Strategy' },
    { id: 'sales_revenue', name: 'Sales & Revenue' },
    { id: 'marketing_brand', name: 'Marketing & Brand' },
    { id: 'product_ux', name: 'Product & UX' },
    { id: 'research_analytics', name: 'Research & Analytics' },
    { id: 'people_culture', name: 'People & Culture' },
    { id: 'operations_supply', name: 'Operations & Supply Chain' },
    { id: 'tech_engineering', name: 'Tech & Engineering' },
    { id: 'finance_legal', name: 'Finance, Legal & Compliance' }
  ];
  
  // Define available specialties (keeping for backward compatibility)
  const availableSpecialtiesList = [
    'science',
    'technology',
    'business',
    'creative',
    'education',
    'communication',
    'analytics',
    'humanities',
    'engineering',
    'healthcare',
    'personal_development',
    'research',
    'leadership',
    'finance',
    'design'
  ];
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      specialties: {},
    }
  };

  // Local state for unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    specialties?: Record<string, number>;
  }>({});
  
  // State for selected functional domains
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  
  // Initialize selected domains from stored specialties
  useEffect(() => {
    if (neuralTuning?.specialties) {
      const domains = Object.keys(neuralTuning.specialties)
        .filter(key => key.includes('_') && functionalDomains.some(domain => domain.id === key));
      
      setSelectedDomains(domains);
    }
  }, [neuralTuning?.specialties]);
  
  // Function to get display name for specialty
  const getDisplayName = (id: string): string => {
    const displayMap: Record<string, string> = {
      'science': 'Science',
      'technology': 'Technology',
      'business': 'Business',
      'creative': 'Creative',
      'education': 'Education',
      'communication': 'Communication',
      'analytics': 'Analytics',
      'humanities': 'Humanities',
      'engineering': 'Engineering',
      'healthcare': 'Healthcare',
      'personal_development': 'Personal Development',
      'research': 'Research',
      'leadership': 'Leadership',
      'finance': 'Finance',
      'design': 'Design'
    };
    
    return displayMap[id] || id.charAt(0).toUpperCase() + id.slice(1);
  };
  
  // Function to handle specialty value changes
  const handleSpecialtyChange = (specialtyId: string, value: number[]) => {
    const specialtyValue = value[0];
    
    setPendingChanges(prev => ({
      ...prev,
      specialties: {
        ...(prev.specialties || {}),
        [specialtyId]: specialtyValue
      }
    }));
    
    setUnsavedChanges(true);
  };
  
  // Function to handle domain selection
  const handleDomainChange = (domainId: string, checked: boolean) => {
    if (checked) {
      setSelectedDomains(prev => [...prev, domainId]);
      
      // Add to specialties with default value
      setPendingChanges(prev => ({
        ...prev,
        specialties: {
          ...(prev.specialties || {}),
          [domainId]: 0.8 // Default to 80% for domain expertise
        }
      }));
    } else {
      setSelectedDomains(prev => prev.filter(id => id !== domainId));
      
      // Remove from specialties
      const updatedSpecialties = { ...(pendingChanges.specialties || {}) };
      delete updatedSpecialties[domainId];
      
      setPendingChanges(prev => ({
        ...prev,
        specialties: updatedSpecialties
      }));
    }
    
    setUnsavedChanges(true);
  };
  
  // Function to add a new specialty
  const addSpecialty = (specialtyId: string) => {
    setPendingChanges(prev => ({
      ...prev,
      specialties: {
        ...(prev.specialties || {}),
        [specialtyId]: 0.5 // Default to 50%
      }
    }));
    
    setUnsavedChanges(true);
  };
  
  // Function to remove a specialty
  const removeSpecialty = (specialtyId: string) => {
    const updatedSpecialties = { ...(pendingChanges.specialties || {}) };
    delete updatedSpecialties[specialtyId];
    
    setPendingChanges(prev => ({
      ...prev,
      specialties: updatedSpecialties
    }));
    
    setUnsavedChanges(true);
  };
  
  // Save pending changes to Neural tuning
  const saveChanges = async () => {
    if (!unsavedChanges) {
      toast({
        title: "No Changes",
        description: "No changes to save.",
        variant: "default",
      });
      return;
    }
    
    try {
      // Update using the mutation function from the hook
      updateTuning(pendingChanges);
      
      // Reset state after saving
      setUnsavedChanges(false);
      setPendingChanges({});
      
      toast({
        title: "Changes Saved",
        description: "Your expertise focus parameters have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating expertise focus:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your expertise focus settings.",
        variant: "destructive",
      });
    }
  };
  
  // Prepare the specialty items for display
  const specialties = Object.entries(neuralTuning?.specialties || {}).sort((a, b) => {
    // Safe number conversion
    const valA = typeof a[1] === 'number' ? a[1] : Number(a[1]);
    const valB = typeof b[1] === 'number' ? b[1] : Number(b[1]);
    return valB - valA; // Sort by value descending
  });
  
  // Filter available specialties
  const availableSpecialtyOptions = availableSpecialtiesList.filter(specialty => 
    !Object.keys({
      ...neuralTuning?.specialties,
      ...pendingChanges.specialties
    }).includes(specialty)
  );
  
  // Loading state
  if (isTuningLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation('/my-neura')} className="p-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Expertise Layer</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading expertise parameters...</p>
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
          <h1 className="text-2xl font-bold">Expertise Focus</h1>
        </div>
        {unsavedChanges && (
          <Button 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
            onClick={saveChanges}
            disabled={isUpdating}
          >
            {isUpdating ? (
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
      
      {/* Expertise Focus Section Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Expertise Focus</CardTitle>
              <CardDescription>
                Define your neural extension's specialized knowledge domains
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-3">
              Adjust the strength of each expertise area to influence how your neural extension responds to relevant topics.
            </p>
            
            {specialties.length > 0 ? (
              <div className="space-y-6">
                {specialties.map(([specialty, value]) => {
                  // Get display name for the specialty
                  const displayName = getDisplayName(specialty);
                  
                  // Calculate the actual value to display
                  const displayValue = pendingChanges.specialties?.[specialty] ?? value;
                  const displayValueNumber = typeof displayValue === 'number' 
                    ? displayValue 
                    : Number(displayValue);
                  
                  return (
                    <div key={specialty} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium capitalize">{displayName}</h3>
                          <HoverCard>
                            <HoverCardTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold capitalize">{displayName} Expertise</h4>
                                <p className="text-sm">
                                  Controls how much your neural extension emphasizes {displayName.toLowerCase()} knowledge and perspectives. Higher values make this domain more prominent in your responses.
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <button 
                            onClick={() => removeSpecialty(specialty)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-1"
                            title="Remove specialty"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {Math.round(displayValueNumber * 100)}%
                        </span>
                      </div>
                      <Slider
                        defaultValue={[typeof value === 'number' ? value : Number(value)]}
                        max={1}
                        step={0.01}
                        value={[typeof displayValue === 'number' ? displayValue : Number(displayValue)]}
                        onValueChange={(val) => handleSpecialtyChange(specialty, val)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Minimal</span>
                        <span>Moderate</span>
                        <span>Specialized</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No specialties added yet</p>
                <Button 
                  variant="outline" 
                  className="group"
                  onClick={() => {
                    // Add a default specialty if none exist
                    if (availableSpecialtyOptions.length > 0) {
                      addSpecialty(availableSpecialtyOptions[0]);
                    }
                  }}
                  disabled={availableSpecialtyOptions.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2 group-hover:text-primary" />
                  Add your first specialty
                </Button>
              </div>
            )}
          </div>
          
          {availableSpecialtyOptions.length > 0 && (
            <div className="mt-8 border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Available Specialties</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add new expertise areas to customize your neural extension's knowledge domains.
              </p>
              
              <ScrollArea className="h-40 rounded-md border p-4">
                <div className="flex flex-wrap gap-2">
                  {availableSpecialtyOptions.map((specialty) => (
                    <Badge 
                      key={specialty}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors capitalize py-1.5"
                      onClick={() => addSpecialty(specialty)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {getDisplayName(specialty)}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-gradient-to-r from-blue-50/50 to-sky-50/50 dark:from-blue-950/50 dark:to-sky-950/50 border-t px-6 py-4 justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/my-neura')}
          >
            Back to My Neura
          </Button>
          
          <Button 
            variant="default"
            onClick={saveChanges}
            disabled={!unsavedChanges || isUpdating}
            className={unsavedChanges ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {isUpdating ? (
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4 mr-1" />
                {unsavedChanges ? "Save Changes" : "No Changes"}
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}