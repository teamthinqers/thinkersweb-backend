import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Lightbulb, Plus, Trash2, Save, BookOpen, Clock, FileText, PieChart, Image, MessageSquare, Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

// Define learning resource types
const learningResourceTypes = [
  { id: 'strategy_frameworks', name: 'Strategy Frameworks', icon: <PieChart className="h-4 w-4" /> },
  { id: 'business_models', name: 'Business Models', icon: <FileText className="h-4 w-4" /> },
  { id: 'books', name: 'Books & Publications', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'case_studies', name: 'Case Studies', icon: <FileText className="h-4 w-4" /> },
  { id: 'research_papers', name: 'Research Papers', icon: <FileText className="h-4 w-4" /> },
  { id: 'industry_reports', name: 'Industry Reports', icon: <PieChart className="h-4 w-4" /> },
  { id: 'thought_leadership', name: 'Thought Leadership', icon: <Lightbulb className="h-4 w-4" /> }
];

// Define learning format options
const learningFormatOptions = [
  { id: 'short_notes', name: 'Short Notes', description: 'Concise bullet points summarizing key concepts', icon: <FileText className="h-5 w-5" /> },
  { id: 'infographics', name: 'Infographics', description: 'Visual representations of data and concepts', icon: <PieChart className="h-5 w-5" /> },
  { id: 'visual_illustrations', name: 'Visual Illustrations', description: 'Detailed diagrams explaining complex ideas', icon: <Image className="h-5 w-5" /> },
  { id: 'structured_frameworks', name: 'Structured Frameworks', description: 'Step-by-step methodologies and models', icon: <FileText className="h-5 w-5" /> },
  { id: 'conversational', name: 'Conversational', description: 'Dialogue-based explanations of concepts', icon: <MessageSquare className="h-5 w-5" /> }
];

// Define learning time options
const learningTimeOptions = [
  { value: '5', label: '5 minutes daily', description: 'Quick micro-learning bites for busy schedules' },
  { value: '10', label: '10 minutes daily', description: 'Balanced learning for steady progress' },
  { value: '15', label: '15 minutes daily', description: 'In-depth learning for maximum comprehension' }
];

// Define professional domains for learning focus
const professionalDomains = [
  { id: 'business_strategy', name: 'Business & Strategy' },
  { id: 'marketing_brand', name: 'Marketing & Brand' },
  { id: 'product_ux', name: 'Product & UX' },
  { id: 'sales_revenue', name: 'Sales & Revenue' },
  { id: 'operations_supply', name: 'Operations & Supply Chain' },
  { id: 'people_culture', name: 'People & Culture' },
  { id: 'finance_legal', name: 'Finance & Legal' },
  { id: 'tech_engineering', name: 'Technology & Engineering' }
];

export default function NeuraTuningLearning() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // DotSpark Tuning hook
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateTuning,
    isUpdating
  } = useDotSparkTuning();
  
  // Learning state
  const [learningTopics, setLearningTopics] = useState<string[]>([]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['short_notes']);
  const [learningTime, setLearningTime] = useState<string>('10');
  const [enableLearningPrompts, setEnableLearningPrompts] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Initialize learning settings from stored data
  useEffect(() => {
    if (status?.tuning) {
      // Set learning topics if they exist
      if (status.tuning.learningFocus) {
        setLearningTopics([...status.tuning.learningFocus]);
      }
      
      // Load saved settings from localStorage 
      const savedResourceTypes = localStorage.getItem('neura_learning_resources');
      const savedFormats = localStorage.getItem('neura_learning_formats');
      const savedTime = localStorage.getItem('neura_learning_time');
      const savedEnabledStatus = localStorage.getItem('neura_learning_prompts_enabled');
      const savedDomains = localStorage.getItem('neura_learning_domains');
      
      if (savedResourceTypes) {
        try {
          setSelectedResourceTypes(JSON.parse(savedResourceTypes));
        } catch (e) {
          console.error("Error parsing saved resource types", e);
        }
      } else {
        // Set defaults
        setSelectedResourceTypes(['strategy_frameworks', 'business_models']);
      }
      
      if (savedFormats) {
        try {
          setSelectedFormats(JSON.parse(savedFormats));
        } catch (e) {
          console.error("Error parsing saved formats", e);
        }
      }
      
      if (savedTime) {
        setLearningTime(savedTime);
      }
      
      if (savedEnabledStatus) {
        setEnableLearningPrompts(savedEnabledStatus === 'true');
      }
      
      if (savedDomains) {
        try {
          setSelectedDomains(JSON.parse(savedDomains));
        } catch (e) {
          console.error("Error parsing saved domains", e);
        }
      }
    }
  }, [status]);
  
  // Handle resource type toggle
  const handleResourceTypeToggle = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedResourceTypes(prev => [...prev, typeId]);
    } else {
      setSelectedResourceTypes(prev => prev.filter(id => id !== typeId));
    }
    setUnsavedChanges(true);
  };
  
  // Handle format toggle
  const handleFormatToggle = (formatId: string, checked: boolean) => {
    if (checked) {
      setSelectedFormats(prev => [...prev, formatId]);
    } else {
      // Prevent removing all formats
      if (selectedFormats.length > 1) {
        setSelectedFormats(prev => prev.filter(id => id !== formatId));
      } else {
        toast({
          title: "Required Selection",
          description: "At least one learning format must be selected.",
          variant: "destructive",
        });
        return;
      }
    }
    setUnsavedChanges(true);
  };
  
  // Handle domain toggle
  const handleDomainToggle = (domainId: string, checked: boolean) => {
    if (checked) {
      setSelectedDomains(prev => [...prev, domainId]);
    } else {
      setSelectedDomains(prev => prev.filter(id => id !== domainId));
    }
    setUnsavedChanges(true);
  };
  
  // Add new topic
  const addTopic = () => {
    if (!newTopic.trim()) return;
    
    const topic = newTopic.trim();
    if (learningTopics.includes(topic)) {
      toast({
        title: "Topic Already Added",
        description: "This topic is already in your learning focus.",
        variant: "destructive",
      });
      return;
    }
    
    setLearningTopics(prev => [...prev, topic]);
    setNewTopic('');
    setUnsavedChanges(true);
  };
  
  // Remove topic
  const removeTopic = (topic: string) => {
    setLearningTopics(prev => prev.filter(t => t !== topic));
    setUnsavedChanges(true);
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };
  
  // Handle learning time change
  const handleLearningTimeChange = (value: string) => {
    setLearningTime(value);
    setUnsavedChanges(true);
  };
  
  // Handle learning prompts toggle
  const handleLearningPromptsToggle = (checked: boolean) => {
    setEnableLearningPrompts(checked);
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
      // Save learning focus to database via API
      updateTuning({
        learningFocus: learningTopics
      });
      
      // Save other settings to localStorage
      localStorage.setItem('neura_learning_resources', JSON.stringify(selectedResourceTypes));
      localStorage.setItem('neura_learning_formats', JSON.stringify(selectedFormats));
      localStorage.setItem('neura_learning_time', learningTime);
      localStorage.setItem('neura_learning_prompts_enabled', String(enableLearningPrompts));
      localStorage.setItem('neura_learning_domains', JSON.stringify(selectedDomains));
      
      setUnsavedChanges(false);
      
      toast({
        title: "Learning Settings Updated",
        description: enableLearningPrompts 
          ? "Your learning settings have been saved. You'll receive prompts on WhatsApp according to your preferences."
          : "Your learning settings have been saved.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating learning settings:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your learning settings.",
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
            <p className="text-muted-foreground">Loading learning settings...</p>
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
        
        {unsavedChanges && (
          <Button 
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
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
      
      {/* Learning Engine Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md mb-8">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
              <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle>Learning Engine</CardTitle>
              <CardDescription>
                Configure how your Neura learns and shares insights with you
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 py-5 px-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/80 dark:to-yellow-950/80 rounded-lg border border-amber-100 dark:border-amber-900">
            {/* Mental Engine Visual */}
            <div className="flex justify-center mb-4">
              <div className="relative w-[200px] h-[120px]">
                {/* Brain outline */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[180px] h-[100px] rounded-t-full border-2 border-amber-300 dark:border-amber-700 border-b-0 flex items-center justify-center">
                    <div className="w-[140px] h-[80px] rounded-t-full border-2 border-amber-400 dark:border-amber-600 border-b-0 flex items-center justify-center">
                      <div className="w-[100px] h-[60px] rounded-t-full border-2 border-amber-500 dark:border-amber-500 border-b-0"></div>
                    </div>
                  </div>
                </div>
                
                {/* Animated cogs/gears */}
                <div className={`absolute top-6 left-7 w-8 h-8 rounded-full border-4 border-t-amber-500 border-r-amber-300 border-b-amber-500 border-l-amber-300 ${enableLearningPrompts ? 'animate-spin' : ''}`} style={{ animationDuration: '7s' }}></div>
                <div className={`absolute top-8 right-7 w-6 h-6 rounded-full border-4 border-t-yellow-500 border-r-yellow-300 border-b-yellow-500 border-l-yellow-300 ${enableLearningPrompts ? 'animate-spin' : ''}`} style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
                
                {/* Lightning bolts for activeness */}
                {enableLearningPrompts && (
                  <>
                    <div className="absolute top-3 left-[90px] text-amber-500 text-lg">⚡</div>
                    <div className="absolute top-10 left-[130px] text-amber-500 text-lg">⚡</div>
                    <div className="absolute top-8 left-[50px] text-amber-500 text-lg">⚡</div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-medium text-amber-800 dark:text-amber-300">Interactive Daily Learning Prompts</h3>
                <p className="text-sm text-amber-700/90 dark:text-amber-400/90">
                  Receive what your Neura learns via WhatsApp
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={enableLearningPrompts} 
                  onCheckedChange={handleLearningPromptsToggle} 
                  id="learning-prompts"
                  className="data-[state=checked]:bg-amber-600"
                />
                <Label htmlFor="learning-prompts" className={`text-sm font-medium ${enableLearningPrompts ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                  {enableLearningPrompts ? 'Activated' : 'Inactive'}
                </Label>
              </div>
            </div>
            
            <div className="mt-3 mb-5 bg-white/80 dark:bg-gray-900/60 rounded-lg p-3 text-sm border border-amber-200 dark:border-amber-800/50">
              <p className="text-amber-800 dark:text-amber-300 font-medium mb-1">Why activate your Learning Engine?</p>
              <p className="text-amber-700/80 dark:text-amber-400/80 text-xs">
                Activating your Learning Engine creates a two-way knowledge exchange where:
              </p>
              <ul className="list-disc text-xs pl-5 mt-1 text-amber-700/80 dark:text-amber-400/80 space-y-1">
                <li>Your Neura continuously learns from professional resources</li>
                <li>You receive bite-sized learning prompts that compound over time</li>
                <li>Both you and your Neura grow together through shared insights</li>
              </ul>
            </div>
            
            {/* Learning time options - always visible but disabled when learning prompts are off */}
            <div className={`mt-4 ${!enableLearningPrompts ? 'opacity-60' : ''}`}>
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Daily Time Investment</h4>
              <div className="grid grid-cols-3 gap-2">
                {learningTimeOptions.map((option) => (
                  <div 
                    key={option.value}
                    className={`rounded-lg border p-3 ${enableLearningPrompts ? 'cursor-pointer' : 'cursor-not-allowed'} transition-all ${
                      learningTime === option.value 
                        ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800'
                    }`}
                    onClick={() => enableLearningPrompts && handleLearningTimeChange(option.value)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        learningTime === option.value ? 'text-amber-700 dark:text-amber-400' : ''
                      }`}>
                        {option.label}
                      </span>
                      <Clock className={`h-4 w-4 ${
                        learningTime === option.value ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
                <div className="flex items-start gap-2">
                  <div className="text-amber-600 dark:text-amber-400 text-lg mt-0.5">📈</div>
                  <div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">The Compound Effect</p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                      Just 10 minutes daily adds up to <span className="font-medium">60+ hours of focused learning per year</span>. 
                      Small, consistent investments lead to remarkable growth over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="topics" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="topics">Learning Topics</TabsTrigger>
              <TabsTrigger value="resources">Resource Types</TabsTrigger>
              <TabsTrigger value="format">Learning Format</TabsTrigger>
            </TabsList>
            
            {/* Learning Topics Tab */}
            <TabsContent value="topics" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Focus Areas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add specific topics you want your Neura to learn about and master.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Input 
                    placeholder="Add specific learning topic (e.g., 'Product-Market Fit', 'Growth Strategies')" 
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    onClick={addTopic}
                    disabled={!newTopic.trim()}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Topic
                  </Button>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Current Learning Priorities</Label>
                  
                  {learningTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {learningTopics.map((topic) => (
                        <Badge 
                          key={topic}
                          variant="outline" 
                          className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-1 py-1.5"
                        >
                          <span>{topic}</span>
                          <button 
                            onClick={() => removeTopic(topic)}
                            className="h-4 w-4 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 inline-flex items-center justify-center ml-1"
                          >
                            <Trash2 className="h-3 w-3 text-amber-700 dark:text-amber-400" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-center">
                      <p className="text-muted-foreground">No learning topics added yet.</p>
                    </div>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Domain Focus</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select professional domains where you want your Neura to build expertise.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {professionalDomains.map((domain) => (
                      <div key={domain.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`domain-${domain.id}`} 
                          checked={selectedDomains.includes(domain.id)}
                          onCheckedChange={(checked) => handleDomainToggle(domain.id, checked === true)}
                        />
                        <label
                          htmlFor={`domain-${domain.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {domain.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Resource Types Tab */}
            <TabsContent value="resources" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Learning Resources</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select types of resources your Neura should continuously learn from.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {learningResourceTypes.map((resource) => (
                    <div 
                      key={resource.id} 
                      className={`p-4 rounded-lg border transition-all ${
                        selectedResourceTypes.includes(resource.id)
                          ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
                          : 'border-gray-200 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id={`resource-${resource.id}`} 
                          checked={selectedResourceTypes.includes(resource.id)}
                          onCheckedChange={(checked) => handleResourceTypeToggle(resource.id, checked === true)}
                          className={selectedResourceTypes.includes(resource.id) ? 'text-amber-600' : ''}
                        />
                        <div>
                          <label
                            htmlFor={`resource-${resource.id}`}
                            className={`text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5 ${
                              selectedResourceTypes.includes(resource.id) ? 'text-amber-700 dark:text-amber-400' : ''
                            }`}
                          >
                            <span className="text-amber-600 dark:text-amber-400">{resource.icon}</span>
                            {resource.name}
                          </label>
                          
                          {resource.id === 'strategy_frameworks' && selectedResourceTypes.includes(resource.id) && (
                            <div className="mt-3 pl-1 text-xs text-muted-foreground">
                              Examples: Porter's Five Forces, BCG Matrix, SWOT Analysis, Blue Ocean Strategy
                            </div>
                          )}
                          
                          {resource.id === 'business_models' && selectedResourceTypes.includes(resource.id) && (
                            <div className="mt-3 pl-1 text-xs text-muted-foreground">
                              Examples: Subscription, Marketplace, Freemium, SaaS, Platform Business Models
                            </div>
                          )}
                          
                          {resource.id === 'books' && selectedResourceTypes.includes(resource.id) && (
                            <div className="mt-3 pl-1 text-xs text-muted-foreground">
                              Recent business publications, leadership books, industry-specific literature
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-100 dark:border-amber-900/50">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Continuous Learning</h4>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                        Neura continuously learns from these resources in the background, enhancing its knowledge and insights. 
                        The more resources you select, the more diverse its knowledge will become.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Learning Format Tab */}
            <TabsContent value="format" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Learning Format Preferences</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select how you'd like to receive learning insights from your Neura via WhatsApp.
                </p>
                
                <div className="space-y-4">
                  {learningFormatOptions.map((format) => (
                    <div 
                      key={format.id} 
                      className={`p-4 rounded-lg border transition-all ${
                        selectedFormats.includes(format.id)
                          ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
                          : 'border-gray-200 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex items-center h-5 mr-3">
                          <Checkbox 
                            id={`format-${format.id}`} 
                            checked={selectedFormats.includes(format.id)}
                            onCheckedChange={(checked) => handleFormatToggle(format.id, checked === true)}
                            className={selectedFormats.includes(format.id) ? 'text-amber-600' : ''}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <label
                              htmlFor={`format-${format.id}`}
                              className={`text-sm font-medium cursor-pointer flex items-center gap-1.5 ${
                                selectedFormats.includes(format.id) ? 'text-amber-700 dark:text-amber-400' : ''
                              }`}
                            >
                              {format.icon}
                              {format.name}
                            </label>
                            
                            {selectedFormats.includes(format.id) && (
                              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format.description}
                          </p>
                          
                          {/* Sample previews based on format */}
                          {format.id === 'short_notes' && selectedFormats.includes(format.id) && (
                            <div className="mt-3 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-xs">
                              <span className="font-semibold block mb-1">Sample:</span>
                              <ul className="list-disc pl-4 space-y-1">
                                <li>Key concept 1: Brief explanation</li>
                                <li>Key concept 2: Brief explanation</li>
                                <li>Practical application: How to implement</li>
                              </ul>
                            </div>
                          )}
                          
                          {format.id === 'infographics' && selectedFormats.includes(format.id) && (
                            <div className="mt-3 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-xs">
                              <span className="font-semibold block mb-1">Sample:</span>
                              <div className="text-center">
                                <span className="text-muted-foreground text-xs">[Visual data representation with clear labels, colors, and relationships]</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-100 dark:border-amber-900/50">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">WhatsApp Learning Prompts</h4>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                        When enabled, Neura will send you learning insights via WhatsApp in your preferred formats.
                        This creates a two-way learning process where both you and your Neura grow together.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}