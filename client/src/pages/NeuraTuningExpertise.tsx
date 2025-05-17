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
    description: 'Novice level with basic understanding. Just started exploring the domain with foundational knowledge.'
  },
  {
    id: 'strategic_builder',
    name: 'Strategic Builder',
    description: 'Hands-on experience with strong understanding of all key concepts and practical implementation skills.'
  },
  {
    id: 'creative_orchestrator',
    name: 'Creative Orchestrator',
    description: 'Expert level who can synthesize multiple perspectives and create innovative solutions in this domain.'
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
      
      // Set default seniority level if not already set
      // Note: In the future if seniority is added to the tuning model, we can
      // uncomment the code below to load it from the server
      // if (status.tuning.seniority) {
      //   setSelectedSeniorityLevel(status.tuning.seniority);
      // }
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
        // Set specialty strength based on expertise level
        const expertiseLevel = domainExpertiseLevels[domainId] || 'strategic_builder';
        let strengthValue = 0.8; // Default value
        
        // Adjust strength based on expertise level
        if (expertiseLevel === 'domain_navigator') {
          strengthValue = 0.7;
        } else if (expertiseLevel === 'creative_orchestrator') {
          strengthValue = 0.9;
        }
        
        specialties[domainId] = strengthValue;
      });
      
      // Store seniority level in localStorage for future reference
      localStorage.setItem('neura_seniority_level', selectedSeniorityLevel);
      
      // Update using mutation - only pass specialties as that's what the backend expects
      updateTuning({
        specialties
      });
      
      setUnsavedChanges(false);
      
      toast({
        title: "Expertise Updated",
        description: "Your professional domains and expertise styles have been saved.",
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
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Professional Expertise Layer</CardTitle>
              <CardDescription>
                Define how your professional expertise should shape Neura's knowledge and recommendations
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 py-3 px-4 bg-white dark:bg-gray-950 rounded-lg border border-blue-100 dark:border-blue-900">
            <div className="grid grid-cols-5 gap-1">
              {['🧠', '🎯', '📊', '🛠️', '📈'].map((icon, i) => (
                <div 
                  key={i} 
                  className={`h-8 flex items-center justify-center rounded-md ${
                    i % 2 === 0 ? 'bg-blue-50 dark:bg-blue-950/50' : 'bg-indigo-50 dark:bg-indigo-950/50'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-center text-muted-foreground mt-2">
              Your expertise selections determine how Neura approaches professional topics
            </p>
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
              {seniorityLevels.map((level) => {
                const isSelected = selectedSeniorityLevel === level.id;
                return (
                  <div 
                    key={level.id} 
                    className={`flex items-start space-x-3 p-4 rounded-lg border 
                      ${isSelected ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/50' : 'border-gray-200 dark:border-gray-800'} 
                      hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200
                      ${isSelected ? 'shadow-md' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <RadioGroupItem value={level.id} id={level.id} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={level.id} className={`font-medium text-base cursor-pointer ${isSelected ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                          {level.name}
                        </Label>
                        {isSelected && (
                          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
                            Selected
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                      {level.id === 'early_professional' && (
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 rounded-md p-2 mt-1 flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-700 dark:text-green-400">Growing Knowledge Base</span>
                        </div>
                      )}
                      {level.id === 'mid_level_manager' && (
                        <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-950/40 dark:to-cyan-900/20 rounded-md p-2 mt-1 flex items-center gap-2">
                          <div className="h-2 w-2 bg-cyan-500 rounded-full"></div>
                          <span className="text-xs text-cyan-700 dark:text-cyan-400">Balanced Expertise & Leadership</span>
                        </div>
                      )}
                      {level.id === 'senior_leader' && (
                        <div className="bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-950/40 dark:to-violet-900/20 rounded-md p-2 mt-1 flex items-center gap-2">
                          <div className="h-2 w-2 bg-violet-500 rounded-full"></div>
                          <span className="text-xs text-violet-700 dark:text-violet-400">Strategic Vision Focus</span>
                        </div>
                      )}
                      {level.id === 'functional_head' && (
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 rounded-md p-2 mt-1 flex items-center gap-2">
                          <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                          <span className="text-xs text-amber-700 dark:text-amber-400">Deep Domain Authority</span>
                        </div>
                      )}
                      {level.id === 'founder_cxo' && (
                        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/20 rounded-md p-2 mt-1 flex items-center gap-2">
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-700 dark:text-red-400">Business Building & Vision Setting</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                
                // Determine domain colors and icons
                let gradientColors, iconBg, iconClass;
                switch(domain.id) {
                  case 'business_strategy':
                    gradientColors = 'from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30';
                    iconBg = 'bg-indigo-100 dark:bg-indigo-900/60';
                    iconClass = '📊';
                    break;
                  case 'sales_revenue':
                    gradientColors = 'from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/30';
                    iconBg = 'bg-emerald-100 dark:bg-emerald-900/60';
                    iconClass = '💰';
                    break;
                  case 'marketing_brand':
                    gradientColors = 'from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/30';
                    iconBg = 'bg-purple-100 dark:bg-purple-900/60';
                    iconClass = '🎯';
                    break;
                  case 'product_ux':
                    gradientColors = 'from-sky-50 to-cyan-50 dark:from-sky-950/40 dark:to-cyan-950/30';
                    iconBg = 'bg-sky-100 dark:bg-sky-900/60';
                    iconClass = '💡';
                    break;
                  case 'research_analytics':
                    gradientColors = 'from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30';
                    iconBg = 'bg-amber-100 dark:bg-amber-900/60';
                    iconClass = '📈';
                    break;
                  case 'people_culture':
                    gradientColors = 'from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/30';
                    iconBg = 'bg-rose-100 dark:bg-rose-900/60';
                    iconClass = '👥';
                    break;
                  case 'operations_supply':
                    gradientColors = 'from-blue-50 to-teal-50 dark:from-blue-950/40 dark:to-teal-950/30';
                    iconBg = 'bg-blue-100 dark:bg-blue-900/60';
                    iconClass = '⚙️';
                    break;
                  case 'tech_engineering':
                    gradientColors = 'from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/30';
                    iconBg = 'bg-violet-100 dark:bg-violet-900/60';
                    iconClass = '💻';
                    break;
                  case 'finance_legal':
                    gradientColors = 'from-gray-50 to-slate-50 dark:from-gray-900/40 dark:to-slate-900/30';
                    iconBg = 'bg-gray-100 dark:bg-gray-800/60';
                    iconClass = '⚖️';
                    break;
                  default:
                    gradientColors = 'from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/30';
                    iconBg = 'bg-gray-100 dark:bg-gray-800/60';
                    iconClass = '✨';
                }
                
                return (
                  <div 
                    key={domain.id} 
                    className={`p-5 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] ${
                      isDomainSelected 
                        ? `border-2 border-blue-300 dark:border-blue-600 bg-gradient-to-br ${gradientColors} shadow-md` 
                        : 'border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-gray-950'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${iconBg} flex items-center justify-center text-xl`}>
                        {iconClass}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor={domain.id}
                            className={`font-semibold text-base cursor-pointer ${
                              isDomainSelected ? 'text-blue-700 dark:text-blue-400' : ''
                            }`}
                          >
                            {domain.name}
                          </label>
                          
                          <Checkbox 
                            id={domain.id}
                            checked={isDomainSelected}
                            onCheckedChange={(checked) => {
                              handleDomainSelection(domain.id, checked === true);
                            }}
                            className={`h-5 w-5 ${isDomainSelected ? 'border-blue-500 text-blue-500' : ''}`}
                          />
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex items-center mb-2">
                          {isDomainSelected ? (
                            <div className="flex items-center text-blue-600 dark:text-blue-400">
                              <Check className="h-3.5 w-3.5 mr-1" />
                              <span>Domain Added to Your Expertise Mix</span>
                            </div>
                          ) : (
                            <span>Tap to include this in your professional expertise blend</span>
                          )}
                        </div>
                    
                        {isDomainSelected && (
                          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                            <h4 className="text-sm font-medium mb-3 text-blue-700 dark:text-blue-400">How do you apply your expertise in {domain.name}?</h4>
                            <RadioGroup 
                              value={expertiseLevel}
                              onValueChange={(value) => handleExpertiseLevelChange(domain.id, value)}
                              className="space-y-3 mt-3"
                            >
                              {expertiseLevels.map((level) => {
                                const isSelected = expertiseLevel === level.id;
                                
                                // Define visual indicators for expertise level
                                let expertiseBadge, expertiseColor, expertiseBg;
                                
                                if (level.id === 'domain_navigator') {
                                  expertiseBadge = '🔍';
                                  expertiseColor = isSelected ? 'text-green-700 dark:text-green-400' : '';
                                  expertiseBg = isSelected ? 'bg-green-50 dark:bg-green-950/30' : '';
                                } else if (level.id === 'strategic_builder') {
                                  expertiseBadge = '🛠️';
                                  expertiseColor = isSelected ? 'text-blue-700 dark:text-blue-400' : '';
                                  expertiseBg = isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : '';
                                } else {
                                  expertiseBadge = '🌟';
                                  expertiseColor = isSelected ? 'text-purple-700 dark:text-purple-400' : '';
                                  expertiseBg = isSelected ? 'bg-purple-50 dark:bg-purple-950/30' : '';
                                }
                                
                                return (
                                  <div 
                                    key={level.id} 
                                    className={`flex items-start p-3 rounded-md transition-all duration-200 ${
                                      isSelected 
                                        ? `shadow-sm border border-blue-200 dark:border-blue-800/50 ${expertiseBg}` 
                                        : 'hover:bg-white/80 dark:hover:bg-gray-900/50'
                                    }`}
                                  >
                                    <div className="flex gap-2 w-full">
                                      <RadioGroupItem value={level.id} id={`${domain.id}-${level.id}`} className="mt-1" />
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                          <Label 
                                            htmlFor={`${domain.id}-${level.id}`} 
                                            className={`text-sm font-medium ${isSelected ? expertiseColor : ''}`}
                                          >
                                            {level.name}
                                            {isSelected && (
                                              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-400">
                                                Selected
                                              </span>
                                            )}
                                          </Label>
                                          <span className="flex-shrink-0 text-lg">{expertiseBadge}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground pr-6">
                                          {level.description}
                                        </p>
                                        
                                        {/* Visual expertise indicator */}
                                        {level.id === 'domain_navigator' && (
                                          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                                            <div className="bg-green-500 h-1.5 rounded-full w-1/3"></div>
                                          </div>
                                        )}
                                        {level.id === 'strategic_builder' && (
                                          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                                            <div className="bg-blue-500 h-1.5 rounded-full w-2/3"></div>
                                          </div>
                                        )}
                                        {level.id === 'creative_orchestrator' && (
                                          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                                            <div className="bg-purple-500 h-1.5 rounded-full w-full"></div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Bottom Save Button */}
          {unsavedChanges && (
            <div className="flex justify-end mt-6">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}