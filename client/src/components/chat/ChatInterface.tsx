import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define message types
interface Message {
  id: string;
  role: "system" | "user" | "assistant" | "entry";
  content: string;
  timestamp: Date;
  entry?: {
    id: number;
    title: string;
    content: string;
    category?: string;
    tags?: { id: number, name: string }[];
  };
}

// Create a unique ID for messages
const generateId = () => Math.random().toString(36).substring(2, 9);

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content: "Welcome to your learning repository! Tell me about something you've learned recently, and I'll help organize it.",
      timestamp: new Date(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      // Process the message to create an entry
      const apiMessages = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));
        
      const processResponse = await apiRequest(
        "POST",
        "/api/chat/process",
        {
          message: input,
          messages: apiMessages,
        }
      ) as any; // Type assertion for API response
      
      if (processResponse?.success) {
        // Add success message with entry details
        const entryMessage: Message = {
          id: generateId(),
          role: "entry",
          content: "I've saved this to your learning repository:",
          timestamp: new Date(),
          entry: {
            id: processResponse.entry?.id,
            title: processResponse.entry?.title,
            content: processResponse.entry?.content,
            category: processResponse.entry?.category?.name,
            tags: processResponse.entry?.tags || [],
          },
        };
        
        setMessages((prev) => [...prev, entryMessage]);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics/frequency'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics/categories'] });
        queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
        
        // Get a follow-up response from the assistant
        const chatResponse = await apiRequest(
          "POST",
          "/api/chat/respond",
          {
            message: input,
            messages: [...apiMessages, { role: "user", content: input }],
          }
        ) as any; // Type assertion for API response
        
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: chatResponse?.response || "I've saved your learning. Anything else you'd like to add?",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "I'm sorry, I had trouble processing that. Could you try again?",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle keyboard input (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 px-1">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "user" ? (
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                  <p>{message.content}</p>
                </div>
              ) : message.role === "entry" ? (
                <Card className="max-w-[80%] border-green-200 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center mb-2 text-sm text-green-600 font-medium">
                      <div className="mr-2 bg-green-100 p-1 rounded-full">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </div>
                      <span>{message.content}</span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-800">{message.entry?.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-2">
                      {message.entry?.content}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.entry?.category && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {message.entry.category}
                        </Badge>
                      )}
                      
                      {message.entry?.tags?.map((tag) => (
                        <Badge key={tag.id} variant="tag" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex">
                  <div className="bg-muted p-2 rounded-full h-8 w-8 flex items-center justify-center mr-2 mt-1">
                    <Bot size={16} className="text-muted-foreground" />
                  </div>
                  <div className="bg-muted text-foreground rounded-lg p-3 max-w-[80%]">
                    <p>{message.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t pt-4 pb-2">
        {isProcessing ? (
          <div className="flex items-center justify-center py-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Processing your learning...</span>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what you've learned..."
              className="min-h-[60px] flex-1 resize-none"
            />
            <Button onClick={handleSendMessage} className="h-auto" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;