import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Removed apiRequest import - using fetch directly

interface ClassificationResult {
  type: 'dot' | 'wheel' | 'chakra';
  confidence: number;
  reasoning: string;
  suggestedStructure: {
    heading?: string;
    summary?: string;
    anchor?: string;
    pulse?: string;
    goals?: string;
    purpose?: string;
    timeline?: string;
  };
  alternativeClassifications?: Array<{
    type: 'dot' | 'wheel' | 'chakra';
    confidence: number;
    reasoning: string;
  }>;
}

export default function IntelligenceClassification() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [sessionId] = useState(`intelligence_${Date.now()}`);

  const analyzeContent = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some content to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const response = await fetch('/api/intelligence/classify', {
        method: 'POST',
        body: JSON.stringify({
          content: input.trim(),
          context: 'Manual intelligence test',
          sessionId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setClassification(result.classification);
        toast({
          title: "Analysis Complete",
          description: `Classified as ${result.classification.type} with ${Math.round(result.classification.confidence * 100)}% confidence`,
        });
      } else {
        throw new Error('Failed to analyze content');
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmAndSave = async (confirmedType: 'dot' | 'wheel' | 'chakra') => {
    if (!classification) return;

    try {
      setIsSaving(true);
      
      // Prepare data based on type
      let data: any = {};
      
      switch (confirmedType) {
        case 'dot':
          data = {
            summary: classification.suggestedStructure.summary || input.substring(0, 220),
            anchor: classification.suggestedStructure.anchor || 'Generated from intelligence analysis',
            pulse: classification.suggestedStructure.pulse || 'focused'
          };
          break;
        case 'wheel':
          data = {
            heading: classification.suggestedStructure.heading || 'New Wheel',
            goals: classification.suggestedStructure.goals || input,
            timeline: classification.suggestedStructure.timeline || '6 months',
            chakraId: null
          };
          break;
        case 'chakra':
          data = {
            heading: classification.suggestedStructure.heading || 'New Chakra',
            purpose: classification.suggestedStructure.purpose || input,
            timeline: classification.suggestedStructure.timeline || '5 years'
          };
          break;
      }
      
      const response = await fetch('/api/intelligence/confirm-and-save', {
        method: 'POST',
        body: JSON.stringify({
          type: confirmedType,
          data,
          originalClassification: classification
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Saved Successfully!",
          description: `Your ${confirmedType} has been saved to the grid`,
        });
        
        // Reset form
        setInput('');
        setClassification(null);
      } else {
        throw new Error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save to grid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeIcon = (type: 'dot' | 'wheel' | 'chakra') => {
    switch (type) {
      case 'dot':
        return <Brain className="h-4 w-4" />;
      case 'wheel':
        return (
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 w-4 h-4 border-2 border-orange-600 rounded-full animate-spin"></div>
            <div className="absolute inset-1 w-2 h-2 border-2 border-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
          </div>
        );
      case 'chakra':
        return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: 'dot' | 'wheel' | 'chakra') => {
    switch (type) {
      case 'dot':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'wheel':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'chakra':
        return 'bg-amber-100 text-amber-800 border-amber-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Advanced Core Intelligence Test
          </CardTitle>
          <CardDescription>
            Enter your thoughts and let the advanced intelligence classify them as dots, wheels, or chakras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your thoughts, ideas, or goals here... The intelligence will analyze and classify them automatically."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{input.length} characters</span>
            <Button 
              onClick={analyzeContent}
              disabled={isAnalyzing || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classification Results */}
      {classification && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <CheckCircle className="h-5 w-5" />
              Intelligence Classification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Classification */}
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(classification.type)}
                  <Badge className={getTypeColor(classification.type)}>
                    {classification.type.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium">
                    {Math.round(classification.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">{classification.reasoning}</p>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => confirmAndSave(classification.type)}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? 'Saving...' : `Confirm as ${classification.type}`}
                </Button>
                
                {/* Alternative Classifications */}
                {classification.alternativeClassifications?.map((alt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => confirmAndSave(alt.type)}
                    disabled={isSaving}
                    className="border-gray-300"
                  >
                    Save as {alt.type} ({Math.round(alt.confidence * 100)}%)
                  </Button>
                ))}
              </div>
            </div>

            {/* Alternative Classifications */}
            {classification.alternativeClassifications && classification.alternativeClassifications.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Alternative Classifications
                </h4>
                {classification.alternativeClassifications.map((alt, index) => (
                  <div key={index} className="p-3 rounded border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(alt.type)}
                      <Badge variant="outline" className={getTypeColor(alt.type)}>
                        {alt.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm">
                        {Math.round(alt.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{alt.reasoning}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Structure */}
            {classification.suggestedStructure && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Suggested Structure</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(classification.suggestedStructure).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex">
                        <span className="font-medium text-blue-700 w-20 capitalize">{key}:</span>
                        <span className="text-blue-600">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Enter your thoughts, goals, or ideas in the text area</li>
              <li>Click "Analyze with AI" to let the intelligence classify the content</li>
              <li>Review the classification result and confidence score</li>
              <li>Confirm the suggested type or choose an alternative classification</li>
              <li>The content will be saved to your DotSpark grid with the chosen structure</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}