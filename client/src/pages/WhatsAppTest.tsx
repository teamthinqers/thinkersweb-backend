import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth-minimal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WhatsAppTest() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tools");

  // Query for getting recent entries
  const { 
    data: entriesData, 
    isLoading: entriesLoading, 
    error: entriesError,
    refetch: refetchEntries
  } = useQuery({
    queryKey: ['/api/entries', { sortBy: 'createdAt', sortOrder: 'desc', limit: 10 }],
    refetchInterval: activeTab === "entries" ? 5000 : false, // Auto-refresh when on entries tab
  });

  // Helper for entry date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSimulate = async () => {
    if (!message) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // First try the simulate endpoint for processing
      const response = await apiRequest("POST", "/api/whatsapp/simulate", { message });
      const data = await response.json();
      
      // Now also create a test entry directly
      const testResponse = await apiRequest("POST", "/api/whatsapp/test-message", {
        message: message,
        userId: 1, // Hardcoded for testing
      });
      
      const testData = await testResponse.json();
      
      setResult({
        ...data,
        entry: testData.entry,
        entryCreated: true
      });
      
      console.log("Simulation result:", data);
      console.log("Test entry created:", testData);
      
      // Refresh entries list
      setTimeout(() => refetchEntries(), 500);
    } catch (err) {
      console.error("Error simulating WhatsApp message:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await apiRequest("GET", "/api/whatsapp/test-webhook");
      const data = await response.json();
      setResult(data);
      console.log("Connection test result:", data);
    } catch (err) {
      console.error("Error testing connection:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to use the WhatsApp test tools.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">WhatsApp Testing Tools</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="tools">Test Tools</TabsTrigger>
          <TabsTrigger value="entries">Recent Entries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test WhatsApp Connection</CardTitle>
                <CardDescription>
                  Verify that the WhatsApp webhook endpoint is correctly configured
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  This will check if the WhatsApp webhook is properly set up in the server.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleTestConnection} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulate WhatsApp Message</CardTitle>
                <CardDescription>
                  Test message processing and entry creation directly from the web interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Type a message to simulate sending via WhatsApp..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mb-4"
                  rows={3}
                />
              </CardContent>
              <CardFooter>
                <Button onClick={handleSimulate} disabled={loading || !message}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    "Simulate Message & Create Entry"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <span>Test Results</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.entry && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <h3 className="font-semibold text-green-800 mb-2">New Entry Created:</h3>
                      <div className="space-y-1 text-sm text-green-700">
                        <p><span className="font-medium">ID:</span> {result.entry.id}</p>
                        <p><span className="font-medium">Title:</span> {result.entry.title}</p>
                        <p><span className="font-medium">Content:</span> {result.entry.content}</p>
                        <p><span className="font-medium">Created:</span> {formatDate(result.entry.createdAt)}</p>
                      </div>
                    </div>
                  )}
                
                  <div className="bg-slate-50 p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Response Details:</h3>
                    <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                  
                  {result.response && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="font-medium mb-2 text-blue-800">WhatsApp Response:</p>
                      <p className="text-blue-700">{result.response}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="entries">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>
                  The most recent entries in your dashboard (includes WhatsApp messages)
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchEntries()}
                disabled={entriesLoading}
              >
                <RefreshCw className={`h-4 w-4 ${entriesLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                </div>
              ) : entriesError ? (
                <div className="text-center py-8 text-red-500">
                  Error loading entries
                </div>
              ) : entriesData?.entries?.length > 0 ? (
                <div className="space-y-4">
                  {entriesData.entries.map((entry: any) => (
                    <div 
                      key={entry.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{entry.title}</h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{entry.content}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        ID: {entry.id} | User ID: {entry.userId}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No entries found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}