import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, Mic, MicOff, Brain } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  
  // Initialize messages from localStorage or default welcome message
  const initializeMessages = (): Message[] => {
    try {
      const savedMessages = localStorage.getItem('dotspark-chat-messages');
      const savedSessionId = localStorage.getItem('dotspark-chat-session-id');
      
      if (savedMessages && savedSessionId) {
        const parsed = JSON.parse(savedMessages);
        // Restore timestamps as Date objects
        const messages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setSessionId(savedSessionId);
        return messages;
      }
    } catch (error) {
      console.error('Error loading saved chat messages:', error);
    }
    
    // Generate new session ID if no existing session
    const newSessionId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem('dotspark-chat-session-id', newSessionId);
    
    return [
      {
        id: generateId(),
        role: "assistant",
        content: "Hello! I'm your advanced AI assistant with ChatGPT-level intelligence and perfect memory. I remember our conversations, understand your patterns, and provide exceptional contextual responses. What's on your mind today?",
        timestamp: new Date(),
      },
    ];
  };
  
  const [messages, setMessages] = useState<Message[]>(initializeMessages);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('dotspark-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Function to start a new chat session
  const startNewChat = () => {
    const newSessionId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem('dotspark-chat-session-id', newSessionId);
    
    const welcomeMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: "Hello! I'm your advanced AI assistant with ChatGPT-level intelligence and perfect memory. I remember our conversations, understand your patterns, and provide exceptional contextual responses. What's on your mind today?",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    localStorage.setItem('dotspark-chat-messages', JSON.stringify([welcomeMessage]));
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Convert audio to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:audio/webm;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
      
      // Send to transcription API
      const transcriptionResponse = await apiRequest("POST", "/api/transcribe-voice", {
        audio: base64Audio,
        mimeType: audioBlob.type
      });
      
      if (transcriptionResponse.text) {
        setInput(String(transcriptionResponse.text));
        toast({
          title: "Voice transcribed",
          description: "Your voice message has been converted to text",
        });
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: "Transcription Error", 
        description: "Could not transcribe your voice message",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsProcessing(true);
    
    try {
      // Use the advanced intelligent conversation system with memory
      const processResponse = await apiRequest(
        "POST",
        "/api/organize-thoughts/continue",
        {
          userInput: input,
          sessionId: sessionId,
          action: "continue"
        }
      ) as any;
      
      // Handle the intelligent response
      if (processResponse?.response) {
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: processResponse.response,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
      
      // If there was a successful dot creation, invalidate queries
      if (processResponse?.savedItems && processResponse.savedItems.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dots'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wheels'] });
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
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-full h-8 w-8 flex items-center justify-center mr-2 mt-1">
                    <Brain size={16} className="text-white" />
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
            <span>Processing your thoughts...</span>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts - I'll provide intelligent, contextual responses..."
              className="min-h-[60px] flex-1 resize-none"
            />
            <div className="flex flex-col space-y-2">
              <Button onClick={handleSendMessage} className="h-auto" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={isRecording ? "bg-red-50 border-red-200 text-red-700" : ""}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;