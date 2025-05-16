import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import ChatInterface from "@/components/chat/ChatInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Brain, User } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple navigation header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Direct Chat with DotSpark</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="h-9 w-9"
            >
              <Home className="h-5 w-5" />
            </Button>
            
            {user && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setLocation("/my-neura")}
                  className="h-9 w-9"
                >
                  <Brain className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setLocation("/dashboard")}
                  className="h-9 w-9"
                >
                  <User className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 md:px-6 max-w-6xl py-6 flex-1">
        <Card className="border rounded-xl shadow-sm overflow-hidden h-[calc(100vh-160px)]">
          <CardContent className="p-0 h-full">
            <ChatInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}