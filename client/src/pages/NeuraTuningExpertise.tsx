import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, ChevronLeft, Save, Info, Plus, Trash2, Check } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define expertise depth profiles
type ExpertiseDepthProfile = {
  id: string;
  name: string;
  description: string;
}

// Define expertise depth profiles
const expertiseDepthProfiles: ExpertiseDepthProfile[] = [
  {
    id: 'domain_navigator',
    name: 'Domain Navigator',
    description: 'Broad knowledge across multiple subjects within a domain. Provides connections and context.'
  },
  {
    id: 'strategic_builder',
    name: 'Strategic Builder',
    description: 'Combines deep conceptual understanding with practical implementation skills. Creates solutions and frameworks.'
  },
  {
    id: 'creative_orchestrator',
    name: 'Creative Orchestrator',
    description: 'Synthesizes multiple perspectives into novel approaches. Excels at generating innovative ideas and unique angles.'
  }
];

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
  
  // Extract values from status for rendering
  const { tuning } = status || { tuning: { specialties: {}, expertiseDepthProfile: 'strategic_builder' } };
  
  // Local state for selections and changes
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedDepthProfile, setSelectedDepthProfile] = useState<string>('strategic_builder');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    specialties?: Record<string, number>;
    expertiseDepthProfile?: string;
  }>({});
  
  // Define traditional specialties (keeping for backward compatibility)
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
  
  // Initialize selected domains and depth profile from stored specialties
  useEffect(() => {
    if (tuning?.specialties) {
      // Set selected domains
      const domains = Object.keys(tuning.specialties)
        .filter(key => key.includes('_') && functionalDomains.some(domain => domain.id === key));
      
      setSelectedDomains(domains);
      
      // Set expertise depth profile if it exists
      if (tuning.expertiseDepthProfile) {
        setSelectedDepthProfile(tuning.expertiseDepthProfile);
      }
    }
  }, [tuning?.specialties, tuning?.expertiseDepthProfile]);
  
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
    
    // Check if it's a functional domain
    const domain = functionalDomains.find(domain => domain.id === id);
    if (domain) {
      return domain.name;
    }
    
    return displayMap[id] || id.charAt(0).toUpperCase() + id.slice(1);
  };
  
  // Handle domain selection/deselection
  const handleDomainSelection = (domainId: string, checked: boolean) => {
    if (checked) {
      // Add domain
      setSelectedDomains(prev => [...prev, domainId]);
      
      // Add to specialties
      setPendingChanges(prev => ({
        ...prev,
        specialties: {
          ...(prev.specialties || {}),
          [domainId]: 0.8 // Default value
        }
      }));
    } else {
      // Remove domain
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
  
  // Handle depth profile change
  const handleDepthProfileChange = (profileId: string) => {
    setSelectedDepthProfile(profileId);
    
    setPendingChanges(prev => ({
      ...prev,
      expertiseDepthProfile: profileId
    }));
    
    setUnsavedChanges(true);
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
        description: "Your expertise layer parameters have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating expertise layer:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your expertise layer settings.",
        variant: "destructive",
      });
    }
  };
  
  // Prepare the specialty items for display
  const specialties = Object.entries(tuning?.specialties || {}).sort((a, b) => {
    // Safe number conversion
    const valA = typeof a[1] === 'number' ? a[1] : Number(a[1]);
    const valB = typeof b[1] === 'number' ? b[1] : Number(b[1]);
    return valB - valA; // Sort by value descending
  });
  
  // Filter available specialties 
  const availableSpecialtyOptions = availableSpecialtiesList.filter(specialty => 
    !Object.keys({
      ...tuning?.specialties,
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
          <h1 className="text-2xl font-bold">Expertise Layer</h1>
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
      
      {/* Expertise Layer Section Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md mb-8">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Expertise Layer</CardTitle>
              <CardDescription>
                Define your specialized knowledge domains and expertise style
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Expertise Depth Profile Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Expertise Depth Profile</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose how you want your expertise to be structured across your domains.
            </p>
            
            <RadioGroup 
              value={selectedDepthProfile} 
              onValueChange={handleDepthProfileChange}
              className="space-y-4"
            >
              {expertiseDepthProfiles.map((profile) => (
                <div key={profile.id} className="flex items-start space-x-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <RadioGroupItem value={profile.id} id={profile.id} className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor={profile.id} className="font-medium text-base">
                      {profile.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {profile.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <Separator className="my-6" />
          
          {/* Functional Domains Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Functional Domains</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select the professional domains where you have expertise. You can select multiple domains.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {functionalDomains.map((domain) => (
                <div 
                  key={domain.id} 
                  className="flex items-start space-x-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <Checkbox 
                    id={domain.id}
                    checked={selectedDomains.includes(domain.id)}
                    onCheckedChange={(checked) => {
                      handleDomainSelection(domain.id, checked === true);
                    }}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor={domain.id}
                      className="font-medium text-sm cursor-pointer"
                    >
                      {domain.name}
                    </label>
                    <div className="text-sm text-muted-foreground">
                      {selectedDomains.includes(domain.id) && (
                        <div className="flex items-center text-blue-600 dark:text-blue-400">
                          <Check className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Traditional Specialties Section */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-3">Specialty Strength</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Adjust the strength of each expertise area to influence how your neural extension responds to relevant topics.
            </p>
            
            {specialties.length > 0 ? (
              <div className="space-y-6">
                {specialties.map(([specialty, value]) => {
                  // Skip if it's a domain (they're managed separately)
                  if (specialty.includes('_') && functionalDomains.some(domain => domain.id === specialty)) {
                    return null;
                  }
                  
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
                          <h3 className="text-base font-medium capitalize">{displayName}</h3>
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-center">
                <p className="text-muted-foreground">No specialties added yet. Add some specialties below.</p>
              </div>
            )}
            
            {/* Add specialty button + dropdown */}
            {availableSpecialtyOptions.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                <p className="w-full text-sm font-medium mb-2">Add specialty:</p>
                {availableSpecialtyOptions.map(specialty => (
                  <Badge 
                    key={specialty}
                    variant="outline" 
                    className="cursor-pointer flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-950 py-1.5 transition-colors"
                    onClick={() => addSpecialty(specialty)}
                  >
                    <Plus className="h-3 w-3" />
                    <span className="capitalize">{getDisplayName(specialty)}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}