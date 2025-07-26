import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Search, 
  Lightbulb, 
  Target, 
  Compass, 
  Sparkles,
  BarChart3,
  Clock,
  User,
  FileText,
  Layers,
  Zap
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CognitiveStructure {
  type: 'dot' | 'wheel' | 'chakra';
  confidence: number;
  reasoning: string;
  keyIndicators: string[];
  suggestedStructure: {
    heading: string;
    content: string;
    timeline?: string;
    purpose?: string;
    goals?: string;
  };
}

interface SemanticAnalysis {
  themes: string[];
  mood: string;
  complexity: 'simple' | 'moderate' | 'complex';
  actionOriented: boolean;
  timeHorizon: 'immediate' | 'short-term' | 'long-term' | 'life-long';
  domains: string[];
  readinessScore: number;
}

interface AnalysisResult {
  classification: CognitiveStructure;
  semanticAnalysis: SemanticAnalysis;
  keyEntities: {
    entities: string[];
    concepts: string[];
    keywords: string[];
    topics: string[];
  };
}

interface IntelligentQueryResult {
  cognitiveStructure: CognitiveStructure;
  semanticAnalysis: SemanticAnalysis;
  relatedContent: any[];
  contextualInsights: {
    insights: string[];
    recommendations: string[];
    connections: string[];
    nextSteps: string[];
  };
  keyEntities: {
    entities: string[];
    concepts: string[];
    keywords: string[];
    topics: string[];
  };
  similarStructures: any[];
}

const CognitiveAnalysisInterface: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [queryResult, setQueryResult] = useState<IntelligentQueryResult | null>(null);
  const [activeTab, setActiveTab] = useState('analyze');

  // Cognitive structure analysis
  const analyzeMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('/api/cognitive/analyze', {
        method: 'POST',
        body: { content }
      });
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        setAnalysisResult(data.data);
      }
    }
  });

  // Intelligent query
  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest('/api/cognitive/query', {
        method: 'POST',
        body: { 
          query, 
          includeVector: true, 
          includeDatabase: true, 
          includeSemantic: true,
          limit: 10 
        }
      });
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        setQueryResult(data.data.results);
      }
    }
  });

  const handleAnalyze = () => {
    if (inputText.trim()) {
      analyzeMutation.mutate(inputText);
    }
  };

  const handleQuery = () => {
    if (inputText.trim()) {
      queryMutation.mutate(inputText);
    }
  };

  const getStructureIcon = (type: string) => {
    switch (type) {
      case 'dot': return <Sparkles className="h-4 w-4" />;
      case 'wheel': return <Target className="h-4 w-4" />;
      case 'chakra': return <Compass className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStructureColor = (type: string) => {
    switch (type) {
      case 'dot': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'wheel': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'chakra': return 'bg-amber-200 text-amber-900 border-amber-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            <Brain className="inline h-8 w-8 mr-2 text-amber-600" />
            Cognitive Analysis & Intelligent Retrieval
          </h1>
          <p className="text-gray-600">
            Advanced AI-powered classification and semantic analysis for Dots, Wheels, and Chakras
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Input Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your thoughts, ideas, or content to analyze..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || analyzeMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Structure'}
              </Button>
              <Button
                onClick={handleQuery}
                disabled={!inputText.trim() || queryMutation.isPending}
                variant="outline"
                className="border-amber-200 hover:bg-amber-50"
              >
                <Search className="h-4 w-4 mr-2" />
                {queryMutation.isPending ? 'Searching...' : 'Intelligent Query'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">Structure Analysis</TabsTrigger>
            <TabsTrigger value="query">Intelligent Retrieval</TabsTrigger>
          </TabsList>

          {/* Structure Analysis Tab */}
          <TabsContent value="analyze" className="space-y-4">
            {analysisResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cognitive Classification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Layers className="h-5 w-5" />
                      <span>Cognitive Classification</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getStructureColor(analysisResult.classification.type)} flex items-center space-x-1`}>
                        {getStructureIcon(analysisResult.classification.type)}
                        <span className="uppercase font-semibold">
                          {analysisResult.classification.type}
                        </span>
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Confidence</div>
                        <div className="font-semibold">
                          {analysisResult.classification.confidence}%
                        </div>
                        <Progress 
                          value={analysisResult.classification.confidence} 
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Reasoning</h4>
                      <p className="text-sm text-gray-600">
                        {analysisResult.classification.reasoning}
                      </p>
                    </div>

                    {analysisResult.classification.keyIndicators.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Indicators</h4>
                        <div className="flex flex-wrap gap-1">
                          {analysisResult.classification.keyIndicators.map((indicator, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Suggested Structure</h4>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <div>
                          <span className="text-sm font-medium">Heading:</span>
                          <p className="text-sm">{analysisResult.classification.suggestedStructure.heading}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Content:</span>
                          <p className="text-sm">{analysisResult.classification.suggestedStructure.content}</p>
                        </div>
                        {analysisResult.classification.suggestedStructure.timeline && (
                          <div>
                            <span className="text-sm font-medium">Timeline:</span>
                            <p className="text-sm">{analysisResult.classification.suggestedStructure.timeline}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Semantic Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Semantic Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Complexity</div>
                        <Badge className={getComplexityColor(analysisResult.semanticAnalysis.complexity)}>
                          {analysisResult.semanticAnalysis.complexity}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Readiness Score</div>
                        <div className="font-semibold">
                          {analysisResult.semanticAnalysis.readinessScore}%
                        </div>
                        <Progress 
                          value={analysisResult.semanticAnalysis.readinessScore} 
                          className="w-full h-2 mt-1"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Mood</div>
                        <div className="font-medium">{analysisResult.semanticAnalysis.mood}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Time Horizon</div>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{analysisResult.semanticAnalysis.timeHorizon}</span>
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Themes</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.semanticAnalysis.themes.map((theme, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Domains</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.semanticAnalysis.domains.map((domain, index) => (
                          <Badge key={index} variant="outline">
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Action Oriented</span>
                      <Badge className={analysisResult.semanticAnalysis.actionOriented ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {analysisResult.semanticAnalysis.actionOriented ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Entities */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Key Entities & Concepts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-sm text-gray-500">Entities</h4>
                        <div className="space-y-1">
                          {analysisResult.keyEntities.entities.map((entity, index) => (
                            <Badge key={index} variant="outline" className="block text-xs">
                              {entity}
                            </Badge>
                          ))}
                          {analysisResult.keyEntities.entities.length === 0 && (
                            <div className="text-xs text-gray-400">None identified</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-sm text-gray-500">Concepts</h4>
                        <div className="space-y-1">
                          {analysisResult.keyEntities.concepts.map((concept, index) => (
                            <Badge key={index} variant="outline" className="block text-xs">
                              {concept}
                            </Badge>
                          ))}
                          {analysisResult.keyEntities.concepts.length === 0 && (
                            <div className="text-xs text-gray-400">None identified</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-sm text-gray-500">Keywords</h4>
                        <div className="space-y-1">
                          {analysisResult.keyEntities.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="block text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {analysisResult.keyEntities.keywords.length === 0 && (
                            <div className="text-xs text-gray-400">None identified</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-sm text-gray-500">Topics</h4>
                        <div className="space-y-1">
                          {analysisResult.keyEntities.topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="block text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {analysisResult.keyEntities.topics.length === 0 && (
                            <div className="text-xs text-gray-400">None identified</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Intelligent Query Tab */}
          <TabsContent value="query" className="space-y-4">
            {queryResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Query Classification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>Query Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-center">
                      <Badge className={`${getStructureColor(queryResult.cognitiveStructure.type)} flex items-center space-x-1`}>
                        {getStructureIcon(queryResult.cognitiveStructure.type)}
                        <span className="uppercase">
                          {queryResult.cognitiveStructure.type}
                        </span>
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Confidence</div>
                      <div className="text-2xl font-bold">
                        {queryResult.cognitiveStructure.confidence}%
                      </div>
                      <Progress 
                        value={queryResult.cognitiveStructure.confidence} 
                        className="w-full h-2 mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contextual Insights */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Contextual Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center space-x-1">
                          <Sparkles className="h-4 w-4" />
                          <span>Insights</span>
                        </h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {queryResult.contextualInsights.insights.map((insight, index) => (
                              <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                                {insight}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>Recommendations</span>
                        </h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {queryResult.contextualInsights.recommendations.map((rec, index) => (
                              <div key={index} className="text-sm p-2 bg-green-50 rounded">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Content & Structures */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="h-5 w-5" />
                      <span>Related Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Vector Search Results</h4>
                        <div className="text-sm text-gray-500 mb-2">
                          {queryResult.relatedContent.length} semantic matches found
                        </div>
                        <ScrollArea className="h-40">
                          <div className="space-y-2">
                            {queryResult.relatedContent.map((item: any, index) => (
                              <div key={index} className="p-2 border rounded text-sm">
                                <div className="font-medium">{(item as any).metadata?.contentType || 'Content'}</div>
                                <div className="text-gray-600 text-xs">
                                  Similarity: {Math.round(((item as any).similarity || 0) * 100)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Similar Structures</h4>
                        <div className="text-sm text-gray-500 mb-2">
                          {queryResult.similarStructures.length} database matches found
                        </div>
                        <ScrollArea className="h-40">
                          <div className="space-y-2">
                            {queryResult.similarStructures.map((item: any, index) => (
                              <div key={index} className="p-2 border rounded text-sm">
                                <div className="flex items-center space-x-1">
                                  {getStructureIcon(item.type)}
                                  <span className="font-medium">{item.heading}</span>
                                </div>
                                <div className="text-gray-600 text-xs">
                                  Similarity: {Math.round((item.similarity || 0) * 100)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CognitiveAnalysisInterface;