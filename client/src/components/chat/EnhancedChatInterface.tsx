import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, Mic, MicOff, Brain, BarChart3 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define enhanced message types
interface EnhancedMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    emotionalTone?: string;
    cognitiveDepth?: number;
    structureHints?: string[];
  };
}

interface ConversationAnalysis {
  structure: {
    type: 'dot' | 'wheel' | 'chakra';
    confidence: number;
    reasoning: string;
    keyIndicators: string[];
  };
  readiness: number;
  nextStep: 'continue_exploring' | 'deepen_insight' | 'structure_ready' | 'guide_to_structure';
  guidanceMessage: string;
  conversationDepth: number;
  userIntentClarity: number;
}

interface StructureProposal {
  type: 'dot' | 'wheel' | 'chakra';
  heading: string;
  content: any;
  confidence: number;
  needsConfirmation: boolean;
}

// Create a unique ID for messages
const generateId = () => Math.random().toString(36).substring(2, 9);

const EnhancedChatInterface: React.FC = () => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [currentAnalysis, setCurrentAnalysis] = useState<ConversationAnalysis | null>(null);
  const [currentProposal, setCurrentProposal] = useState<StructureProposal | null>(null);
  const [conversationQuality, setConversationQuality] = useState<number>(0);
  
  // Initialize messages from localStorage or default welcome message
  const initializeMessages = (): EnhancedMessage[] => {
    try {
      const savedMessages = localStorage.getItem('dotspark-enhanced-chat-messages');
      const savedSessionId = localStorage.getItem('dotspark-enhanced-chat-session-id');
      
      if (savedMessages && savedSessionId) {
        const parsed = JSON.parse(savedMessages);
        const messages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setSessionId(savedSessionId);
        return messages;
      }
    } catch (error) {
      console.error('Error loading saved enhanced chat messages:', error);
    }
    
    const newSessionId = `enhanced-chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem('dotspark-enhanced-chat-session-id', newSessionId);
    
    return [
      {
        id: generateId(),
        role: "assistant",
        content: "Hi! I'm your enhanced DotSpark cognitive coach. I'm trained to help you develop dots, wheels, and chakras through intelligent conversation. Share what's on your mind, and I'll guide you naturally toward structured insights.",
        timestamp: new Date(),
      },
    ];
  };
  
  const [messages, setMessages] = useState<EnhancedMessage[]>(initializeMessages);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('dotspark-enhanced-chat-messages', JSON.stringify(messages));
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
    const newSessionId = `enhanced-chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem('dotspark-enhanced-chat-session-id', newSessionId);
    
    const welcomeMessage: EnhancedMessage = {
      id: generateId(),
      role: "assistant",
      content: "Hi! I'm your enhanced DotSpark cognitive coach. I'm trained to help you develop dots, wheels, and chakras through intelligent conversation. Share what's on your mind, and I'll guide you naturally toward structured insights.",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    setCurrentAnalysis(null);
    setCurrentProposal(null);
    setConversationQuality(0);
    localStorage.setItem('dotspark-enhanced-chat-messages', JSON.stringify([welcomeMessage]));
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
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
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
          resolve(result.split(',')[1]);
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
  
  // Handle sending a message with enhanced cognitive coaching
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: EnhancedMessage = {
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
      // Prepare messages for API (exclude metadata for compatibility)
      const apiMessages = updatedMessages.slice(1).map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // Call enhanced chat API
      const response = await apiRequest("POST", "/api/chat/enhanced", {
        message: userMessage.content,
        messages: apiMessages,
        sessionId: sessionId,
        model: "gpt-4o"
      });

      // Update analysis and quality metrics
      setCurrentAnalysis(response.analysis);
      setConversationQuality(response.conversationQuality || 0);
      
      // Handle structure proposals
      if (response.structureProposal) {
        setCurrentProposal(response.structureProposal);
      }

      // Add assistant response
      const assistantMessage: EnhancedMessage = {
        id: generateId(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending enhanced message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: EnhancedMessage = {
        id: generateId(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try rephrasing your message.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle structure confirmation
  const handleConfirmStructure = async () => {
    if (!currentProposal) return;
    
    try {
      setIsProcessing(true);
      
      // Here you would save the structure to the backend
      toast({
        title: "Structure Saved",
        description: `Your ${currentProposal.type} has been saved successfully!`,
      });
      
      setCurrentProposal(null);
      
      const confirmationMessage: EnhancedMessage = {
        id: generateId(),
        role: "assistant",
        content: `Perfect! Your ${currentProposal.type} has been saved. You can find it in your DotSpark collection. Is there anything else you'd like to explore?`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      
    } catch (error) {
      console.error('Error saving structure:', error);
      toast({
        title: "Save Error",
        description: "Could not save structure. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get structure icon and color
  const getStructureDisplay = (type: string) => {
    switch (type) {
      case 'dot':
        return { icon: '•', color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'wheel':
        return { icon: '⚙', color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'chakra':
        return { icon: '◉', color: 'text-amber-800', bg: 'bg-amber-200' };
      default:
        return { icon: '•', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header with Analysis Panel */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Enhanced Cognitive Chat</h2>
            <Button onClick={startNewChat} variant="outline" size="sm">
              New Chat
            </Button>
          </div>
          {conversationQuality > 0 && (
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Quality: {conversationQuality}%</span>
            </div>
          )}
        </div>
        
        {/* Analysis Panel */}
        {currentAnalysis && (
          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <span>Conversation Analysis</span>
                {(() => {
                  const display = getStructureDisplay(currentAnalysis.structure.type);
                  return (
                    <Badge className={`${display.bg} ${display.color} border-0`}>
                      {display.icon} {currentAnalysis.structure.type.toUpperCase()}
                    </Badge>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium">Readiness:</span>
                  <Progress value={currentAnalysis.readiness} className="mt-1 h-2" />
                  <span className="text-gray-500">{currentAnalysis.readiness}%</span>
                </div>
                <div>
                  <span className="font-medium">Intent Clarity:</span>
                  <Progress value={currentAnalysis.userIntentClarity} className="mt-1 h-2" />
                  <span className="text-gray-500">{currentAnalysis.userIntentClarity}%</span>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <Progress value={currentAnalysis.structure.confidence} className="mt-1 h-2" />
                  <span className="text-gray-500">{currentAnalysis.structure.confidence}%</span>
                </div>
              </div>
              
              <div className="text-xs space-y-1">
                <div><span className="font-medium">Next Step:</span> {currentAnalysis.nextStep.replace(/_/g, ' ')}</div>
                <div><span className="font-medium">Depth:</span> {currentAnalysis.conversationDepth}/10</div>
              </div>
              
              {currentAnalysis.structure.keyIndicators.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium">Key Indicators:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentAnalysis.structure.keyIndicators.map((indicator, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                        "{indicator}"
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-4 h-4" />
                  <span className="text-xs font-medium">DotSpark Coach</span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {/* Structure Proposal */}
        {currentProposal && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-sm text-green-800">
                Structure Proposal: {currentProposal.type.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium">{currentProposal.heading}</h4>
                <pre className="text-xs mt-2 whitespace-pre-wrap">
                  {JSON.stringify(currentProposal.content, null, 2)}
                </pre>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleConfirmStructure}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Save {currentProposal.type}
                </Button>
                <Button 
                  onClick={() => setCurrentProposal(null)}
                  variant="outline"
                  size="sm"
                >
                  Modify
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share your thoughts for cognitive coaching..."
              className="min-h-[52px] max-h-[200px] resize-none"
              disabled={isProcessing}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant="outline"
              size="sm"
              disabled={isProcessing}
              className={isRecording ? "bg-red-100 border-red-300" : ""}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isProcessing || !input.trim()}
              size="sm"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;