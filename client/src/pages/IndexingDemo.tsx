import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles,
  Database,
  Network,
  Eye,
  MessageSquare,
  Lightbulb,
  ChevronRight,
  BarChart3,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SemanticMatch {
  id: string;
  content: string;
  similarity: number;
  type: 'dot' | 'wheel' | 'chakra';
  metadata: any;
}

interface Pattern {
  theme: string;
  frequency: number;
  contexts: string[];
  confidence: number;
}

interface Gap {
  area: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestions: string[];
}

interface IndexingStats {
  totalVectors: number;
  totalPatterns: number;
  coverage: number;
  lastUpdate: string;
}

export default function IndexingDemo() {
  const [activeTab, setActiveTab] = useState('semantic');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId] = useState('user_123'); // Mock user ID
  const [isLoading, setIsLoading] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticMatch[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [stats, setStats] = useState<IndexingStats>({
    totalVectors: 0,
    totalPatterns: 0,
    coverage: 0,
    lastUpdate: new Date().toISOString()
  });
  const { toast } = useToast();

  // Load indexing statistics
  useEffect(() => {
    loadIndexingStats();
  }, []);

  const loadIndexingStats = async () => {
    try {
      const response = await fetch('/api/indexing/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const performSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/indexing/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          userId,
          limit: 10,
          threshold: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSemanticResults(data.matches || []);
        toast({
          title: "Semantic Search Complete",
          description: `Found ${data.matches?.length || 0} similar thoughts`
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to perform semantic search",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePatterns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/indexing/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setPatterns(data.patterns || []);
        toast({
          title: "Pattern Analysis Complete",
          description: `Discovered ${data.patterns?.length || 0} thinking patterns`
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze patterns",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const detectGaps = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/indexing/detect-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setGaps(data.gaps || []);
        toast({
          title: "Gap Detection Complete",
          description: `Identified ${data.gaps?.length || 0} areas for development`
        });
      }
    } catch (error) {
      toast({
        title: "Detection Failed",
        description: "Unable to detect gaps",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFullReindex = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/indexing/full-reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Reindexing Complete",
          description: `Processed ${data.processedCount || 0} cognitive structures`
        });
        loadIndexingStats();
      }
    } catch (error) {
      toast({
        title: "Reindexing Failed",
        description: "Unable to complete reindexing",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'bg-green-500';
    if (similarity >= 0.8) return 'bg-blue-500';
    if (similarity >= 0.7) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getGapSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              DotSpark Cognitive Indexing
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced semantic search, pattern recognition, and cognitive gap detection for your thoughts and insights
          </p>
        </div>

        {/* Stats Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Indexing Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{stats.totalVectors}</div>
                <div className="text-sm text-gray-600">Vector Embeddings</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPatterns}</div>
                <div className="text-sm text-gray-600">Identified Patterns</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.coverage}%</div>
                <div className="text-sm text-gray-600">Content Coverage</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <Button onClick={triggerFullReindex} disabled={isLoading} className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Reindex All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="semantic" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Semantic Search
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Pattern Analysis
            </TabsTrigger>
            <TabsTrigger value="gaps" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Gap Detection
            </TabsTrigger>
          </TabsList>

          {/* Semantic Search Tab */}
          <TabsContent value="semantic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Semantic Recall of Similar Thoughts
                </CardTitle>
                <CardDescription>
                  Find thoughts with similar meaning, even if they use different words
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe what you're looking for..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
                    className="flex-1"
                  />
                  <Button onClick={performSemanticSearch} disabled={isLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {semanticResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Similar Thoughts Found:</h3>
                    {semanticResults.map((result) => (
                      <Card key={result.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{result.type}</Badge>
                              <div className={`h-2 w-16 rounded-full ${getSimilarityColor(result.similarity)}`}></div>
                              <span className="text-sm text-gray-600">{(result.similarity * 100).toFixed(1)}% match</span>
                            </div>
                            <p className="text-gray-700">{result.content}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pattern Analysis Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Pattern Matching Across Wheels & Chakras
                </CardTitle>
                <CardDescription>
                  Discover recurring themes and thinking patterns in your cognitive structures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={analyzePatterns} disabled={isLoading} className="w-full">
                  <Network className="h-4 w-4 mr-2" />
                  Analyze My Thinking Patterns
                </Button>

                {patterns.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Discovered Patterns:</h3>
                    {patterns.map((pattern, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-amber-600">{pattern.theme}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{pattern.frequency} occurrences</Badge>
                              <Progress value={pattern.confidence * 100} className="w-20" />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {pattern.contexts.map((context, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {context}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gap Detection Tab */}
          <TabsContent value="gaps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Cognitive Gap Detection
                </CardTitle>
                <CardDescription>
                  Identify blind spots and areas for deeper reflection in your thinking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={detectGaps} disabled={isLoading} className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Detect Cognitive Gaps
                </Button>

                {gaps.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Areas for Development:</h3>
                    {gaps.map((gap, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{gap.area}</h4>
                            <Badge className={`${getGapSeverityColor(gap.severity)} text-white`}>
                              {gap.severity} priority
                            </Badge>
                          </div>
                          <p className="text-gray-600">{gap.description}</p>
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Suggestions:</h5>
                            {gap.suggestions.map((suggestion, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              What This Enables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
                <Search className="h-8 w-8 text-amber-600 mb-3" />
                <h3 className="font-semibold mb-2">Semantic Recall</h3>
                <p className="text-sm text-gray-600">Find similar thoughts using meaning, not just keywords</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                <Network className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Pattern Matching</h3>
                <p className="text-sm text-gray-600">Discover themes across your wheels and chakras</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <Zap className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-2">Spark Generation</h3>
                <p className="text-sm text-gray-600">Create insights based on cognitive similarity</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Gap Detection</h3>
                <p className="text-sm text-gray-600">Identify blind spots in leadership and reflection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}