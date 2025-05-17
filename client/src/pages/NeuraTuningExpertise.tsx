import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, ChevronLeft, Save, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define profile types
type Profile = {
  id: string;
  name: string;
  description: string;
}

// Define seniority levels
const seniorityLevels: Profile[] = [
  {
    id: 'early_professional',
    name: 'Early Professional',
    description: 'Building foundational skills and knowledge in your field. 0-5 years of experience.'
  },
  {
    id: 'mid_level_manager',
    name: 'Mid-Level Manager',
    description: 'Leading teams and projects with established expertise. 5-10 years of experience.'
  },
  {
    id: 'senior_leader',
    name: 'Senior Leader',
    description: 'Providing strategic direction and mentorship. 10-15 years of experience.'
  },
  {
    id: 'functional_head',
    name: 'Functional Head',
    description: 'Leading entire functions with deep domain expertise. 15+ years of focused experience.'
  },
  {
    id: 'founder_cxo',
    name: 'Founder / CXO',
    description: 'Executive level with broad strategic oversight and business building experience.'
  }
];

// Define expertise levels within domains
const expertiseLevels: Profile[] = [
  {
    id: 'domain_navigator',
    name: 'Domain Navigator',
    description: 'Broad knowledge across the domain. Connects concepts and provides context effectively.'
  },
  {
    id: 'strategic_builder',
    name: 'Strategic Builder',
    description: 'Deep conceptual understanding combined with practical implementation expertise.'
  },
  {
    id: 'creative_orchestrator',
    name: 'Creative Orchestrator',
    description: 'Synthesizes multiple perspectives into novel approaches and innovative solutions.'
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
  
  // Local state for selections and changes
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [domainExpertiseLevels, setDomainExpertiseLevels] = useState<Record<string, string>>({});
  const [selectedSeniorityLevel, setSelectedSeniorityLevel] = useState<string>('mid_level_manager');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Initialize from stored data
  useEffect(() => {
    if (status?.tuning) {
      // Extract domains from specialties if they exist
      if (status.tuning.specialties) {
        const domains = Object.keys(status.tuning.specialties)
          .filter(key => key.includes('_') && functionalDomains.some(domain => domain.id === key));
        
        setSelectedDomains(domains);
        
        // Initialize expertise levels
        const initialExpertiseLevels: Record<string, string> = {};
        domains.forEach(domainId => {
          initialExpertiseLevels[domainId] = 'strategic_builder';
        });
        setDomainExpertiseLevels(initialExpertiseLevels);
      }
      
      // Set seniority level if it exists
      if (status.tuning.seniority) {
        setSelectedSeniorityLevel(status.tuning.seniority);
      }
    }
  }, [status]);
  
  // Handle domain selection/deselection
  const handleDomainSelection = (domainId: string, checked: boolean) => {
    if (checked) {
      // Add domain
      setSelectedDomains(prev => [...prev, domainId]);
      
      // Set default expertise level
      setDomainExpertiseLevels(prev => ({
        ...prev,
        [domainId]: 'strategic_builder'
      }));
    } else {
      // Remove domain
      setSelectedDomains(prev => prev.filter(id => id !== domainId));
      
      // Remove expertise level
      const updatedLevels = { ...domainExpertiseLevels };
      delete updatedLevels[domainId];
      setDomainExpertiseLevels(updatedLevels);
    }
    
    setUnsavedChanges(true);
  };
  
  // Handle expertise level change for a domain
  const handleExpertiseLevelChange = (domainId: string, level: string) => {
    setDomainExpertiseLevels(prev => ({
      ...prev,
      [domainId]: level
    }));
    
    setUnsavedChanges(true);
  };
  
  // Handle seniority level change
  const handleSeniorityLevelChange = (level: string) => {
    setSelectedSeniorityLevel(level);
    setUnsavedChanges(true);
  };
  
  // Save changes
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
      // Prepare specialties with domain expertise levels
      const specialties: Record<string, number> = {};
      selectedDomains.forEach(domainId => {
        specialties[domainId] = 0.8; // Default strength value
      });
      
      // Update using mutation
      updateTuning({
        specialties,
        seniority: selectedSeniorityLevel
      });
      
      setUnsavedChanges(false);
      
      toast({
        title: "Changes Saved",
        description: "Your expertise layer settings have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating expertise layer:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your expertise settings.",
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
            <h1 className="text-2xl font-bold">Expertise Layer</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading expertise settings...</p>
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
                Define your professional seniority and domain expertise
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Seniority Level Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Professional Seniority</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select your current professional seniority level.
            </p>
            
            <RadioGroup 
              value={selectedSeniorityLevel} 
              onValueChange={handleSeniorityLevelChange}
              className="space-y-4"
            >
              {seniorityLevels.map((level) => (
                <div key={level.id} className="flex items-start space-x-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <RadioGroupItem value={level.id} id={level.id} className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor={level.id} className="font-medium text-base">
                      {level.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {level.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <Separator className="my-6" />
          
          {/* Functional Domains Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Functional Domains & Expertise</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select your professional domains and choose your expertise style for each domain.
            </p>
            
            <div className="space-y-6">
              {functionalDomains.map((domain) => {
                const isDomainSelected = selectedDomains.includes(domain.id);
                const expertiseLevel = domainExpertiseLevels[domain.id] || 'strategic_builder';
                
                return (
                  <div 
                    key={domain.id} 
                    className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <Checkbox 
                        id={domain.id}
                        checked={isDomainSelected}
                        onCheckedChange={(checked) => {
                          handleDomainSelection(domain.id, checked === true);
                        }}
                        className="mt-1"
                      />
                      <div className="space-y-1 flex-1">
                        <label
                          htmlFor={domain.id}
                          className="font-medium text-base cursor-pointer"
                        >
                          {domain.name}
                        </label>
                        <div className="text-sm text-muted-foreground flex items-center">
                          {isDomainSelected ? (
                            <div className="flex items-center text-blue-600 dark:text-blue-400">
                              <Check className="h-3.5 w-3.5 mr-1" />
                              <span>Domain Selected</span>
                            </div>
                          ) : (
                            <span>Click to add this domain to your expertise</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isDomainSelected && (
                      <div className="ml-8 mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-800">
                        <h4 className="text-sm font-medium mb-3">Expertise Style in {domain.name}</h4>
                        <RadioGroup 
                          value={expertiseLevel}
                          onValueChange={(value) => handleExpertiseLevelChange(domain.id, value)}
                          className="space-y-3"
                        >
                          {expertiseLevels.map((level) => (
                            <div key={level.id} className="flex items-start space-x-2">
                              <RadioGroupItem value={level.id} id={`${domain.id}-${level.id}`} className="mt-1" />
                              <div className="space-y-1">
                                <Label htmlFor={`${domain.id}-${level.id}`} className="text-sm font-medium">
                                  {level.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {level.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}