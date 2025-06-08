import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Shield, AlertTriangle, CheckCircle, Zap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CogniShieldProfile {
  decisionSpeed: number;
  riskTolerance: number;
  analyticalDepth: number;
  communicationStyle: number;
  detailLevel: number;
  creativityBias: number;
  logicalStructure: number;
  learningStyle: string;
  conceptualApproach: number;
  priorityFramework: string[];
  ethicalStance: string;
  domainExpertise: string[];
  professionalLevel: string;
}

interface DeviationAnalysis {
  hasDeviation: boolean;
  deviationScore: number;
  deviationAreas: string[];
  suggestedCorrections: string[];
  alignmentPrompt: string;
}

interface AlignmentMonitoring {
  overallAlignmentScore: number;
  sessionDeviations: DeviationAnalysis[];
  recommendations: string[];
  cognitivePatterns: {
    consistency: number;
    adaptability: number;
    preference_adherence: number;
  };
}

const CogniShieldMonitor: React.FC = () => {
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<DeviationAnalysis | null>(null);
  const [sessionMonitoring, setSessionMonitoring] = useState<AlignmentMonitoring | null>(null);
  const [cogniProfile, setCogniProfile] = useState<CogniShieldProfile | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testResponse, setTestResponse] = useState('');

  // Load user's CogniShield profile from local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('cognishield-profile');
    if (savedProfile) {
      try {
        setCogniProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading CogniShield profile:', error);
      }
    }
  }, []);

  const analyzeAlignment = async () => {
    if (!testInput || !testResponse || !cogniProfile) {
      toast({
        title: "Missing Information",
        description: "Please provide test input, response, and ensure your CogniShield profile is configured.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsMonitoring(true);
      const result = await apiRequest('POST', '/api/cognishield/analyze', {
        aiResponse: testResponse,
        userInput: testInput,
        cogniProfile
      });

      const data = await result.json();
      if (data.success) {
        setCurrentAnalysis(data.analysis);
        toast({
          title: "Analysis Complete",
          description: `Deviation score: ${(data.analysis.deviationScore * 100).toFixed(1)}%`,
          variant: data.analysis.hasDeviation ? "destructive" : "default"
        });
      }
    } catch (error) {
      console.error('Error analyzing alignment:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze cognitive alignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  const getAlignmentColor = (score: number) => {
    if (score < 0.3) return 'text-green-600';
    if (score < 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlignmentStatus = (score: number) => {
    if (score < 0.3) return 'Aligned';
    if (score < 0.6) return 'Minor Deviation';
    return 'Significant Deviation';
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Shield className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CogniShield Monitor</h1>
          <p className="text-gray-600">Real-time cognitive alignment monitoring and analysis</p>
        </div>
      </div>

      {!cogniProfile && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            CogniShield profile not found. Please configure your cognitive preferences in the Neura Tuning section first.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="monitor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
          <TabsTrigger value="analysis">Alignment Analysis</TabsTrigger>
          <TabsTrigger value="insights">Session Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-amber-600" />
                Real-time Alignment Testing
              </CardTitle>
              <CardDescription>
                Test AI responses against your cognitive profile to monitor alignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  User Input
                </label>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter the user input that prompted the AI response..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  AI Response
                </label>
                <textarea
                  value={testResponse}
                  onChange={(e) => setTestResponse(e.target.value)}
                  placeholder="Enter the AI response to analyze for cognitive alignment..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={4}
                />
              </div>

              <Button 
                onClick={analyzeAlignment}
                disabled={isMonitoring || !cogniProfile}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isMonitoring ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Analyze Alignment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {currentAnalysis ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Alignment Analysis Results
                    </span>
                    <Badge 
                      variant={currentAnalysis.hasDeviation ? "destructive" : "default"}
                      className={getAlignmentColor(currentAnalysis.deviationScore)}
                    >
                      {getAlignmentStatus(currentAnalysis.deviationScore)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Cognitive alignment score and deviation analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Alignment Score</span>
                      <span className={`text-sm font-bold ${getAlignmentColor(currentAnalysis.deviationScore)}`}>
                        {((1 - currentAnalysis.deviationScore) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(1 - currentAnalysis.deviationScore) * 100} 
                      className="h-2"
                    />
                  </div>

                  {currentAnalysis.deviationAreas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Deviation Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.deviationAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-amber-700 border-amber-300">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentAnalysis.suggestedCorrections.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Corrections</h4>
                      <ul className="space-y-2">
                        {currentAnalysis.suggestedCorrections.map((correction, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                            {correction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Data</h3>
                <p className="text-gray-600">
                  Run an alignment analysis to see detailed results and recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-600" />
                Session Insights
              </CardTitle>
              <CardDescription>
                Overall cognitive alignment patterns and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  Session-wide cognitive pattern analysis and insights will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CogniShieldMonitor;