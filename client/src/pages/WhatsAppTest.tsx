import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function WhatsAppTest() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!message) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await apiRequest("POST", "/api/whatsapp/simulate", { message });
      const data = await response.json();
      setResult(data);
      console.log("Simulation result:", data);
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
                "Simulate Message"
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
                <span>Result</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            
            {result.response && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md">
                <p className="font-medium mb-2 text-green-800 dark:text-green-300">WhatsApp Response:</p>
                <p className="text-green-700 dark:text-green-400">{result.response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}