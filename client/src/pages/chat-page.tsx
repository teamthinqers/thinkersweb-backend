import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import ChatInterface from "@/components/chat/ChatInterface";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-6xl py-6">
      <h1 className="text-2xl font-bold mb-6">Direct Chat with DotSpark</h1>
      
      <Card className="border rounded-xl shadow-sm overflow-hidden h-[calc(100vh-220px)]">
        <CardContent className="p-0 h-full">
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}