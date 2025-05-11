import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import TestingControls from "@/components/testing/TestingControls";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Shield, User, Bell, CheckCircle, ToggleLeft, Terminal, Bug } from "lucide-react";

/**
 * Testing page for debugging and testing various user flows
 * This page provides tools to reset state and test different user scenarios
 */
export default function Testing() {
  const { toast } = useToast();
  
  // Empty search handler for header
  const handleSearch = () => {};
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="flex items-center gap-2 mb-8">
          <Terminal className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Developer Testing Panel</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main testing controls */}
          <div className="md:col-span-1">
            <TestingControls />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Testing Instructions</CardTitle>
                <CardDescription>
                  Use these tools to simulate different user states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-start">
                  <Bug className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span>
                    <strong>Reset WhatsApp Connection</strong> - Simulate a new user that hasn't connected WhatsApp yet
                  </span>
                </p>
                <p className="flex items-start">
                  <Bug className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span>
                    <strong>Reset First-Time Flags</strong> - Clear flags that track whether you've seen onboarding
                  </span>
                </p>
                <p className="flex items-start">
                  <Bug className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span>
                    <strong>Reset All Data</strong> - Log out and clear everything to restart from scratch
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Current state display */}
          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Current Application State</CardTitle>
                <CardDescription>
                  This shows your current localStorage and sessionStorage values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="localStorage">
                  <TabsList className="mb-4">
                    <TabsTrigger value="localStorage">Local Storage</TabsTrigger>
                    <TabsTrigger value="sessionStorage">Session Storage</TabsTrigger>
                    <TabsTrigger value="cookies">Cookies</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="localStorage" className="mt-0">
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md overflow-auto max-h-[400px]">
                      <pre className="text-xs">
                        {Object.entries(localStorage).map(([key, value]) => (
                          <div key={key} className="mb-2">
                            <strong className="text-blue-600 dark:text-blue-400">{key}:</strong> {value}
                          </div>
                        ))}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sessionStorage" className="mt-0">
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md overflow-auto max-h-[400px]">
                      <pre className="text-xs">
                        {Object.entries(sessionStorage).map(([key, value]) => (
                          <div key={key} className="mb-2">
                            <strong className="text-green-600 dark:text-green-400">{key}:</strong> {value}
                          </div>
                        ))}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="cookies" className="mt-0">
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-md overflow-auto max-h-[400px]">
                      <pre className="text-xs">
                        {document.cookie.split(';').map((cookie, i) => (
                          <div key={i} className="mb-2">
                            {cookie.trim()}
                          </div>
                        ))}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}