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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            {/* Learning Engine Activation */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/80 dark:to-amber-950/80 rounded-xl border border-amber-200 dark:border-amber-800/70 p-4 shadow-sm overflow-hidden relative">
              <div className="absolute -right-10 top-0 opacity-10 text-6xl">🧠</div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-amber-900 dark:text-amber-300">Learning Engine</h3>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/60 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400">Always On</span>
              </div>
              
              <div className="flex justify-center mb-4">
                <div className="relative h-[90px] w-[90px]">
                  {/* Brain with animated gears */}
                  <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/60 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🧠</span>
                  </div>
                  
                  {/* Constantly spinning gears - always active */}
                  <div className="absolute top-1 right-0 w-5 h-5 rounded-full border-2 border-t-amber-500 border-r-amber-400 border-b-amber-500 border-l-amber-400 animate-spin" style={{ animationDuration: '6s' }}></div>
                  <div className="absolute -bottom-1 right-6 w-6 h-6 rounded-full border-3 border-t-yellow-500 border-r-yellow-400 border-b-yellow-500 border-l-yellow-400 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}></div>
                  <div className="absolute top-6 -left-1 w-4 h-4 rounded-full border-2 border-t-amber-600 border-r-amber-500 border-b-amber-600 border-l-amber-500 animate-spin" style={{ animationDuration: '4s' }}></div>
                  
                  {/* Always shows energy */}
                  <div className="absolute -top-1 left-4 text-yellow-500 dark:text-yellow-400 text-sm">⚡</div>
                </div>
              </div>
              
              <p className="text-xs text-center text-amber-700 dark:text-amber-400 mb-3">
                Your Neura is always learning in the background
              </p>
              
              <div className="flex justify-center">
                <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full shadow-sm border border-amber-200 dark:border-amber-900/60">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Active</span>
                </div>
              </div>
            </div>
            
            {/* Interactive WhatsApp Learning */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/80 dark:to-teal-950/80 rounded-xl border border-emerald-200 dark:border-emerald-800/70 p-4 shadow-sm overflow-hidden relative">
              <div className="absolute -right-10 top-0 opacity-10 text-6xl">💬</div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-300">WhatsApp Learning</h3>
                <div className="flex items-center gap-1.5">
                  <Switch 
                    checked={enableLearningPrompts} 
                    onCheckedChange={handleLearningPromptsToggle} 
                    id="learning-prompts"
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="learning-prompts" className={`text-xs font-medium ${enableLearningPrompts ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {enableLearningPrompts ? 'ON' : 'OFF'}
                  </Label>
                </div>
              </div>
              
              <div className="flex justify-center mb-3">
                <div className="relative h-[90px] w-[90px]">
                  {/* WhatsApp messaging visualization */}
                  <div className={`absolute inset-0 ${enableLearningPrompts ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-gray-100 dark:bg-gray-800'} rounded-full flex items-center justify-center`}>
                    <span className="text-3xl">{enableLearningPrompts ? '📲' : '📱'}</span>
                  </div>
                  
                  {/* Message bubbles animation - only when enabled */}
                  {enableLearningPrompts && (
                    <>
                      <div className="absolute top-0 left-6 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>💡</div>
                      <div className="absolute bottom-1 right-0 animate-bounce" style={{ animationDuration: '1.5s' }}>📚</div>
                      <div className="absolute top-8 -left-2 animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.2s' }}>🔍</div>
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-center text-emerald-700 dark:text-emerald-400 mb-3">
                {enableLearningPrompts 
                  ? "Receive daily learning snippets via WhatsApp"
                  : "Activate to get daily insights on WhatsApp"}
              </p>
              
              {/* Time investment options - always visible */}
              <div className={`grid grid-cols-3 gap-1 mt-3 ${!enableLearningPrompts ? 'opacity-70' : ''}`}>
                {learningTimeOptions.map((option) => (
                  <div 
                    key={option.value}
                    className={`rounded-lg p-2 ${enableLearningPrompts ? 'cursor-pointer' : 'cursor-default'} transition-all text-center ${
                      learningTime === option.value 
                        ? 'bg-white dark:bg-gray-900 border border-emerald-300 dark:border-emerald-700 shadow-sm' 
                        : 'border border-transparent hover:bg-white/70 dark:hover:bg-gray-900/50'
                    }`}
                    onClick={() => enableLearningPrompts && handleLearningTimeChange(option.value)}
                  >
                    <div className="text-lg mb-1 flex justify-center">
                      {option.value === '5' && '⚡'}
                      {option.value === '10' && '⚡⚡'}
                      {option.value === '15' && '⚡⚡⚡'}
                    </div>
                    <span className={`text-xs font-medium block ${
                      learningTime === option.value ? 'text-emerald-700 dark:text-emerald-400' : ''
                    }`}>
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Compound effect banner - always visible */}
          <div className={`mt-4 ${!enableLearningPrompts ? 'opacity-70' : ''}`}>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
              {/* Visual elements */}
              <div className="absolute right-3 top-3 text-4xl opacity-20 rotate-12">⏱️</div>
              <div className="absolute left-24 bottom-3 text-xl opacity-20">📚</div>
              
              <div className="flex items-start gap-3 relative">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/60 rounded-full flex-shrink-0 mt-1">
                  <div className="text-xl animate-pulse">📈</div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent inline-block">The Exponential Effect</h3>
                  
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 relative overflow-hidden">
                    {/* Main section title */}
                    <div className="text-center mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white">10 min daily habit</span>
                    </div>
                    
                    {/* Knowledge growth visualization */}
                    <div className="relative h-[120px] mb-3">
                      {/* Exponential curve */}
                      <svg viewBox="0 0 300 100" className="absolute inset-0 w-full h-full">
                        <defs>
                          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
                          </linearGradient>
                        </defs>
                        {/* Reference grid lines */}
                        <line x1="0" y1="90" x2="300" y2="90" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="0" y1="60" x2="300" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="0" y1="30" x2="300" y2="30" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                        
                        {/* Linear growth reference line */}
                        <line x1="30" y1="80" x2="270" y2="30" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3,3" />
                        
                        {/* Exponential curve */}
                        <path d="M30,80 Q90,75 150,60 T210,30 Q240,15 270,5" 
                              stroke="url(#curveGradient)" 
                              strokeWidth="3" 
                              fill="none" />
                      </svg>
                      
                      {/* Time markers */}
                      <div className="absolute bottom-0 left-[10%] flex flex-col items-center">
                        <div className="w-1 h-2 bg-indigo-300 dark:bg-indigo-700"></div>
                        <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Week 1</span>
                      </div>
                      
                      <div className="absolute bottom-0 left-[50%] flex flex-col items-center">
                        <div className="w-1 h-2 bg-indigo-400 dark:bg-indigo-600"></div>
                        <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Month 3</span>
                      </div>
                      
                      <div className="absolute bottom-0 right-[10%] flex flex-col items-center">
                        <div className="w-1 h-2 bg-indigo-500 dark:bg-indigo-500"></div>
                        <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Year 1</span>
                      </div>
                      
                      {/* Knowledge bubbles */}
                      <div className="absolute left-[10%] bottom-[30%] w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center">
                        <span className="text-[8px] text-indigo-600 dark:text-indigo-300">5</span>
                      </div>
                      
                      <div className="absolute left-[30%] bottom-[35%] w-5 h-5 rounded-full bg-indigo-300 dark:bg-indigo-700 flex items-center justify-center">
                        <span className="text-[9px] text-indigo-600 dark:text-indigo-300">15</span>
                      </div>
                      
                      <div className="absolute left-[50%] bottom-[45%] w-6 h-6 rounded-full bg-indigo-400 dark:bg-indigo-600 flex items-center justify-center">
                        <span className="text-[10px] text-indigo-50">30</span>
                      </div>
                      
                      <div className="absolute left-[70%] bottom-[65%] w-8 h-8 rounded-full bg-indigo-500 dark:bg-indigo-500 flex items-center justify-center animate-pulse">
                        <span className="text-[11px] text-indigo-50">60</span>
                      </div>
                      
                      <div className="absolute right-[10%] bottom-[85%] w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-400 flex items-center justify-center animate-pulse">
                        <span className="text-xs text-indigo-50">120+</span>
                      </div>
                      
                      {/* Labels */}
                      <div className="absolute top-0 right-4 flex flex-col items-end">
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Knowledge</span>
                        <span className="text-[8px] text-indigo-500 dark:text-indigo-500">depth & connections</span>
                      </div>
                      
                      <div className="absolute bottom-0 right-4">
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Time</span>
                      </div>
                      
                      {/* Linear vs Exponential labels */}
                      <div className="absolute top-[50%] left-[40%] rotate-[-10deg]">
                        <span className="text-[8px] text-gray-500 dark:text-gray-400">Linear</span>
                      </div>
                      
                      <div className="absolute top-[30%] left-[65%] rotate-[-35deg]">
                        <span className="text-[9px] font-medium text-indigo-500 dark:text-indigo-400">Exponential</span>
                      </div>
                    </div>
                    
                    {/* Key metrics highlighting */}
                    <div className="grid grid-cols-3 gap-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-2">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">10</div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-500">minutes daily</div>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-500 dark:text-indigo-400">
                          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center relative">
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">60+</div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-500">hours yearly</div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
                      </div>
                    </div>
                    
                    {/* Knowledge network visualization */}
                    <div className="mt-3 flex justify-center">
                      <div className="relative w-[200px] h-[30px]">
                        {/* Connecting lines */}
                        <svg viewBox="0 0 200 30" className="absolute inset-0 w-full h-full">
                          <line x1="20" y1="15" x2="60" y2="15" stroke="#c7d2fe" strokeWidth="1" />
                          <line x1="140" y1="15" x2="180" y2="15" stroke="#a5b4fc" strokeWidth="1" />
                          <line x1="20" y1="15" x2="60" y2="5" stroke="#c7d2fe" strokeWidth="1" />
                          <line x1="20" y1="15" x2="60" y2="25" stroke="#c7d2fe" strokeWidth="1" />
                          <line x1="140" y1="15" x2="180" y2="5" stroke="#a5b4fc" strokeWidth="1" />
                          <line x1="140" y1="15" x2="180" y2="25" stroke="#a5b4fc" strokeWidth="1" />
                          <line x1="60" y1="5" x2="140" y2="5" stroke="#818cf8" strokeWidth="1" />
                          <line x1="60" y1="25" x2="140" y2="25" stroke="#818cf8" strokeWidth="1" />
                        </svg>
                        
                        {/* Knowledge nodes - Day 1 */}
                        <div className="absolute left-5 top-[50%] transform -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-200 dark:bg-indigo-900"></div>
                        <div className="absolute left-[30%] top-[15%] transform -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-300 dark:bg-indigo-800"></div>
                        <div className="absolute left-[30%] top-[50%] transform -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-300 dark:bg-indigo-800"></div>
                        <div className="absolute left-[30%] top-[85%] transform -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-300 dark:bg-indigo-800"></div>
                        
                        {/* Knowledge nodes - Year 1 */}
                        <div className="absolute right-5 top-[50%] transform -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-500 dark:bg-indigo-500 animate-pulse"></div>
                        <div className="absolute right-[30%] top-[15%] transform -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-400 dark:bg-indigo-600 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                        <div className="absolute right-[30%] top-[50%] transform -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-400 dark:bg-indigo-600 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                        <div className="absolute right-[30%] top-[85%] transform -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-400 dark:bg-indigo-600 animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                        
                        {/* Day 1 / Year 1 labels */}
                        <div className="absolute left-3 bottom-[-15px] text-[8px] text-indigo-500">Day 1</div>
                        <div className="absolute right-3 bottom-[-15px] text-[8px] text-indigo-500">Year 1</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-indigo-600/90 dark:text-indigo-400/90 border-t border-indigo-100 dark:border-indigo-900/50 pt-2">
                    <span className="font-medium block mb-0.5">Each session amplifies your knowledge exponentially!</span>
                    Quick daily learning creates a knowledge network that grows faster as connections multiply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-8">
            {/* Section 1: Active Learning Mode */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <h3 className="text-lg font-medium mb-3 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Active Learning Mode
              </h3>
              
              <p className="text-sm text-amber-700/90 dark:text-amber-400/90 mb-4">
                Your Neura is always in active learning mode, continuously absorbing information from trusted sources to enhance its knowledge base.
              </p>
              
              <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-full">
                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Always-On Learning</div>
                    <div className="text-xs text-amber-600/80 dark:text-amber-400/80">Continuous behind-the-scenes knowledge acquisition</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-500">Active</span>
                </div>
              </div>
              
              {/* The Exponential Effect section */}
              <div className="mt-5">
                {/* Reusing our exponential visualization that we created earlier */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 relative overflow-hidden">
                  {/* Main section title */}
                  <div className="text-center mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white">10 min daily habit</span>
                  </div>
                  
                  {/* Knowledge growth visualization */}
                  <div className="relative h-[120px] mb-3">
                    {/* Exponential curve */}
                    <svg viewBox="0 0 300 100" className="absolute inset-0 w-full h-full">
                      <defs>
                        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
                        </linearGradient>
                      </defs>
                      {/* Reference grid lines */}
                      <line x1="0" y1="90" x2="300" y2="90" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                      <line x1="0" y1="60" x2="300" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                      <line x1="0" y1="30" x2="300" y2="30" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                      
                      {/* Linear growth reference line */}
                      <line x1="30" y1="80" x2="270" y2="30" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3,3" />
                      
                      {/* Exponential curve */}
                      <path d="M30,80 Q90,75 150,60 T210,30 Q240,15 270,5" 
                            stroke="url(#curveGradient)" 
                            strokeWidth="3" 
                            fill="none" />
                    </svg>
                    
                    {/* Time markers */}
                    <div className="absolute bottom-0 left-[10%] flex flex-col items-center">
                      <div className="w-1 h-2 bg-indigo-300 dark:bg-indigo-700"></div>
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Week 1</span>
                    </div>
                    
                    <div className="absolute bottom-0 left-[50%] flex flex-col items-center">
                      <div className="w-1 h-2 bg-indigo-400 dark:bg-indigo-600"></div>
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Month 3</span>
                    </div>
                    
                    <div className="absolute bottom-0 right-[10%] flex flex-col items-center">
                      <div className="w-1 h-2 bg-indigo-500 dark:bg-indigo-500"></div>
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Year 1</span>
                    </div>
                    
                    {/* Knowledge bubbles */}
                    <div className="absolute left-[10%] bottom-[30%] w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center">
                      <span className="text-[8px] text-indigo-600 dark:text-indigo-300">5</span>
                    </div>
                    
                    <div className="absolute left-[30%] bottom-[35%] w-5 h-5 rounded-full bg-indigo-300 dark:bg-indigo-700 flex items-center justify-center">
                      <span className="text-[9px] text-indigo-600 dark:text-indigo-300">15</span>
                    </div>
                    
                    <div className="absolute left-[50%] bottom-[45%] w-6 h-6 rounded-full bg-indigo-400 dark:bg-indigo-600 flex items-center justify-center">
                      <span className="text-[10px] text-indigo-50">30</span>
                    </div>
                    
                    <div className="absolute left-[70%] bottom-[65%] w-8 h-8 rounded-full bg-indigo-500 dark:bg-indigo-500 flex items-center justify-center animate-pulse">
                      <span className="text-[11px] text-indigo-50">60</span>
                    </div>
                    
                    <div className="absolute right-[10%] bottom-[85%] w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-400 flex items-center justify-center animate-pulse">
                      <span className="text-xs text-indigo-50">120+</span>
                    </div>
                    
                    {/* Labels */}
                    <div className="absolute top-0 right-4 flex flex-col items-end">
                      <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Knowledge</span>
                      <span className="text-[8px] text-indigo-500 dark:text-indigo-500">depth & connections</span>
                    </div>
                    
                    <div className="absolute bottom-0 right-4">
                      <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Time</span>
                    </div>
                    
                    {/* Linear vs Exponential labels */}
                    <div className="absolute top-[50%] left-[40%] rotate-[-10deg]">
                      <span className="text-[8px] text-gray-500 dark:text-gray-400">Linear</span>
                    </div>
                    
                    <div className="absolute top-[30%] left-[65%] rotate-[-35deg]">
                      <span className="text-[9px] font-medium text-indigo-500 dark:text-indigo-400">Exponential</span>
                    </div>
                  </div>
                  
                  {/* Key metrics highlighting */}
                  <div className="grid grid-cols-3 gap-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-2">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">10</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-500">minutes daily</div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-500 dark:text-indigo-400">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center relative">
                      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">60+</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-500">hours yearly</div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-xs text-amber-600/80 dark:text-amber-400/80 mt-3">
                <span className="font-medium">Cross-domain learning</span> creates sharper insights and more robust knowledge connections
              </div>
            </div>
            
            {/* Section 2: Focus Areas Selection */}
            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Learning Focus Areas
              </h3>
              
              <div className="space-y-6">
                {/* Domain Focus selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Domain Focus</h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 italic">Prefer cross-domain learning for sharper insights</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {professionalDomains.map((domain) => (
                      <div 
                        key={domain.id} 
                        onClick={() => handleDomainToggle(domain.id, !selectedDomains.includes(domain.id))}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center space-x-2 ${
                          selectedDomains.includes(domain.id)
                            ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30'
                            : 'border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                        }`}
                      >
                        <Checkbox 
                          id={`domain-${domain.id}`} 
                          checked={selectedDomains.includes(domain.id)}
                          onCheckedChange={(checked) => handleDomainToggle(domain.id, checked === true)}
                          className={selectedDomains.includes(domain.id) ? 'text-indigo-600' : ''}
                        />
                        <label
                          htmlFor={`domain-${domain.id}`}
                          className={`text-sm font-medium leading-none cursor-pointer ${
                            selectedDomains.includes(domain.id) ? 'text-indigo-700 dark:text-indigo-400' : ''
                          }`}
                        >
                          {domain.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Specific Learning Topics */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Specific Topics</h4>
                  <p className="text-xs text-muted-foreground mb-4">
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
                  
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                    <Label className="text-xs font-medium mb-2 block">Current Learning Priorities</Label>
                    
                    {learningTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {learningTopics.map((topic) => (
                          <Badge 
                            key={topic}
                            variant="outline" 
                            className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 flex items-center gap-1 py-1.5"
                          >
                            <span>{topic}</span>
                            <button 
                              onClick={() => removeTopic(topic)}
                              className="h-4 w-4 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 inline-flex items-center justify-center ml-1"
                            >
                              <Trash2 className="h-3 w-3 text-indigo-700 dark:text-indigo-400" />
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
                </div>
              </div>
            </div>
            
            {/* Section 3: Learning Format Preferences */}
            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  WhatsApp Learning Preferences
                </h3>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={enableLearningPrompts} 
                    onCheckedChange={handleLearningPromptsToggle} 
                    id="whatsapp-learning"
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="whatsapp-learning" className={`text-sm font-medium ${enableLearningPrompts ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {enableLearningPrompts ? 'ON' : 'OFF'}
                  </Label>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {enableLearningPrompts 
                  ? "Select how you'd like to receive learning insights from your Neura via WhatsApp."
                  : "Enable to receive personalized learning updates via WhatsApp."}
              </p>
              
              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${!enableLearningPrompts ? 'opacity-60 pointer-events-none' : ''}`}>
                {learningFormatOptions.map((format) => (
                  <div 
                    key={format.id} 
                    onClick={() => enableLearningPrompts && handleFormatToggle(format.id, !selectedFormats.includes(format.id))}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFormats.includes(format.id)
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                        : 'border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${selectedFormats.includes(format.id) ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-gray-100 dark:bg-gray-900'}`}>
                        <span className={selectedFormats.includes(format.id) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                          {format.icon}
                        </span>
                      </div>
                      <div>
                        <label
                          className={`text-sm font-medium cursor-pointer ${
                            selectedFormats.includes(format.id) ? 'text-emerald-700 dark:text-emerald-400' : ''
                          }`}
                        >
                          {format.name}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 ml-2">
                      <Checkbox 
                        id={`format-${format.id}`} 
                        checked={selectedFormats.includes(format.id)}
                        onCheckedChange={(checked) => enableLearningPrompts && handleFormatToggle(format.id, checked === true)}
                        className={selectedFormats.includes(format.id) ? 'text-emerald-600' : ''}
                      />
                      <label
                        htmlFor={`format-${format.id}`}
                        className="text-xs font-medium leading-none ml-2"
                      >
                        {selectedFormats.includes(format.id) ? 'Selected' : 'Select'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add a "Random Mix" option */}
              <div 
                className={`mt-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedFormats.length > 1
                    ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/30'
                    : 'border-gray-200 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 opacity-60'
                } ${!enableLearningPrompts ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${selectedFormats.length > 1 ? 'bg-purple-100 dark:bg-purple-900/60' : 'bg-gray-100 dark:bg-gray-900'}`}>
                    <Zap className={selectedFormats.length > 1 ? 'h-5 w-5 text-purple-600 dark:text-purple-400' : 'h-5 w-5 text-gray-500 dark:text-gray-400'} />
                  </div>
                  <div>
                    <div className={`text-sm font-medium cursor-pointer ${
                      selectedFormats.length > 1 ? 'text-purple-700 dark:text-purple-400' : ''
                    }`}>
                      Random Mix of Selected Formats
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFormats.length > 1 
                        ? `Automatically alternates between your ${selectedFormats.length} selected formats for variety`
                        : "Select multiple formats above to enable random mix"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Time investment options */}
              <div className={`mt-5 ${!enableLearningPrompts ? 'opacity-60' : ''}`}>
                <h4 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">Daily Learning Time</h4>
                
                <div className="grid grid-cols-3 gap-2">
                  {learningTimeOptions.map((option) => (
                    <div 
                      key={option.value}
                      onClick={() => enableLearningPrompts && handleLearningTimeChange(option.value)}
                      className={`rounded-lg p-3 cursor-pointer transition-all text-center ${
                        learningTime === option.value 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm' 
                          : 'border border-gray-200 dark:border-gray-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10'
                      }`}
                    >
                      <div className="text-lg mb-1 flex justify-center">
                        {option.value === '5' && '⚡'}
                        {option.value === '10' && '⚡⚡'}
                        {option.value === '15' && '⚡⚡⚡'}
                      </div>
                      <span className={`text-sm font-medium block ${
                        learningTime === option.value ? 'text-emerald-700 dark:text-emerald-400' : ''
                      }`}>
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {option.value === '5' && '30 hours/year'}
                        {option.value === '10' && '60+ hours/year'}
                        {option.value === '15' && '90+ hours/year'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}