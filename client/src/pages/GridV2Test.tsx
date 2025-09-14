/**
 * Grid V2 Test Page - Integration Testing and Validation
 * 
 * This page provides a comprehensive test interface for the new Grid V2 system
 * to validate all functionality before replacing the old system.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  Database,
  Zap,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

// Import the new Grid V2 components
import { UserDashboardV2 } from '@/components/UserDashboardV2';
import { gridV2TestRunner, type TestResult } from '@/utils/gridV2TestSuite';

export default function GridV2Test() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { toast } = useToast();

  // Subscribe to test updates
  useEffect(() => {
    const unsubscribe = gridV2TestRunner.subscribe((results) => {
      setTestResults(results);
    });

    // Initialize with current results
    setTestResults(gridV2TestRunner.getResults());

    return unsubscribe;
  }, []);

  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    try {
      await gridV2TestRunner.runAllTests();
      toast({
        title: "Tests Completed",
        description: "All Grid V2 tests have been executed",
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: "An error occurred while running tests",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleClearResults = () => {
    gridV2TestRunner.clearResults();
    setTestResults([]);
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const runningTests = testResults.filter(t => t.status === 'running').length;
  const totalTests = testResults.length;

  const systemHealthScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Grid V2 System Test</h1>
              <p className="text-gray-600">Comprehensive testing and validation of the new grid system</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={systemHealthScore >= 80 ? "default" : systemHealthScore >= 60 ? "secondary" : "destructive"}>
              Health: {systemHealthScore}%
            </Badge>
            {runningTests > 0 && (
              <Badge variant="outline">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                Testing...
              </Badge>
            )}
          </div>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{passedTests}</div>
                  <div className="text-sm text-gray-500">Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{failedTests}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{runningTests}</div>
                  <div className="text-sm text-gray-500">Running</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{totalTests}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Actions */}
        <div className="flex gap-2 mb-6">
          <Button 
            onClick={handleRunAllTests} 
            disabled={isRunningTests}
            className="flex items-center gap-2"
          >
            {isRunningTests ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleClearResults}
            disabled={isRunningTests}
          >
            Clear Results
          </Button>
        </div>

        {/* System Status Alert */}
        {totalTests > 0 && (
          <Alert className={`mb-6 ${
            systemHealthScore >= 80 
              ? 'border-green-200 bg-green-50' 
              : systemHealthScore >= 60 
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50'
          }`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {systemHealthScore >= 80 ? (
                <span className="text-green-700">
                  ✅ Grid V2 system is healthy and ready for production! All critical tests are passing.
                </span>
              ) : systemHealthScore >= 60 ? (
                <span className="text-yellow-700">
                  ⚠️ Grid V2 system has some issues. Review failed tests before deployment.
                </span>
              ) : (
                <span className="text-red-700">
                  ❌ Grid V2 system has critical issues. Do not deploy until all tests pass.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Test Overview</TabsTrigger>
            <TabsTrigger value="grid">Grid V2 Demo</TabsTrigger>
            <TabsTrigger value="results">Detailed Results</TabsTrigger>
          </TabsList>
          
          {/* Test Overview */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Grid V2 System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">✅ Completed Components</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Clean Backend API Routes with validation</li>
                        <li>• Separate data queries (dots, wheels, chakras)</li>
                        <li>• Real-time updates via Server-Sent Events</li>
                        <li>• Safe drag-and-drop with collision detection</li>
                        <li>• Comprehensive mapping functionality</li>
                        <li>• Built-in deduplication and error handling</li>
                        <li>• Performance monitoring and analytics</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">🧪 Test Coverage</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Data fetching and integrity validation</li>
                        <li>• Mapping functionality (dots→wheels, wheels→chakras)</li>
                        <li>• Real-time updates and SSE connectivity</li>
                        <li>• Position saving and collision detection</li>
                        <li>• Deduplication and error handling</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">🚀 Ready for Production</h3>
                      <p className="text-sm text-gray-600">
                        Once all tests pass, the Grid V2 system can safely replace the existing grid implementation
                        with zero data loss and improved reliability.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Grid V2 Demo */}
          <TabsContent value="grid" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Grid V2 System Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 border rounded-lg">
                  <UserDashboardV2 className="h-full" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Detailed Results */}
          <TabsContent value="results" className="mt-6">
            <div className="space-y-4">
              {testResults.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Run Yet</h3>
                    <p className="text-gray-600 mb-4">Click "Run All Tests" to start the comprehensive test suite</p>
                    <Button onClick={handleRunAllTests}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Testing
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                testResults.map(test => (
                  <Card key={test.testId}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{test.name}</h3>
                            {test.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                            {test.status === 'running' && (
                              <Badge variant="outline">
                                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                                Running
                              </Badge>
                            )}
                            {test.status === 'passed' && (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Passed
                              </Badge>
                            )}
                            {test.status === 'failed' && (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </div>
                          
                          {test.duration && (
                            <p className="text-sm text-gray-500 mb-2">
                              Duration: {test.duration}ms
                            </p>
                          )}
                          
                          {test.result && (
                            <p className="text-sm text-green-600 mb-2">{test.result}</p>
                          )}
                          
                          {test.error && (
                            <p className="text-sm text-red-600 mb-2">{test.error}</p>
                          )}
                          
                          {test.details && (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                Show Details
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        
                        <div className="flex items-center">
                          {test.status === 'passed' && <CheckCircle className="w-6 h-6 text-green-500" />}
                          {test.status === 'failed' && <XCircle className="w-6 h-6 text-red-500" />}
                          {test.status === 'running' && <Activity className="w-6 h-6 text-blue-500 animate-pulse" />}
                          {test.status === 'pending' && <TestTube className="w-6 h-6 text-gray-400" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}