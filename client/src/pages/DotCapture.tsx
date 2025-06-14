import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Type, 
  Send, 
  Globe,
  ArrowLeft,
  Brain,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DotCapture() {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [captureMode, setCaptureMode] = useState<'voice' | 'text'>('voice');
  const [showOptions, setShowOptions] = useState(true);
  const { toast } = useToast();

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setTextInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or use text input",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      if (isRecording) {
        recognition.start();
      } else {
        recognition.stop();
      }

      return () => recognition.stop();
    }
  }, [isRecording, toast]);

  const handleVoiceToggle = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(!isRecording);
      setShowOptions(false);
    } else {
      toast({
        title: "Voice capture not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
    }
  };

  const handleTextMode = () => {
    setCaptureMode('text');
    setShowOptions(false);
  };

  const handleSubmit = () => {
    if (!textInput.trim()) {
      toast({
        title: "No content to capture",
        description: "Please add some text or use voice recording",
        variant: "destructive"
      });
      return;
    }

    // Here you would normally save the capture
    toast({
      title: "Thought captured!",
      description: "Your insight has been saved",
    });

    // Clear and reset
    setTextInput('');
    setShowOptions(true);
    setCaptureMode('voice');
  };

  const handleOpenFullApp = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 overflow-y-auto">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          
          {/* Dot Logo Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
              <img 
                src="/dotspark-icon-only.jpeg" 
                alt="DotSpark" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/dotspark-logo-icon.jpeg";
                  target.onerror = () => {
                    target.src = "/dotspark-pwa-final.png";
                  };
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent">DotSpark</h1>
              <p className="text-gray-600">Capture your Thoughts/Insights as Dots instantly</p>
            </div>
          </div>

          {/* Main Interface */}
          {showOptions ? (
            /* Enhanced Navigation Interface */
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-2xl relative overflow-hidden">
              <CardContent className="p-8 space-y-8 relative z-10">
                {/* Animated dot connections background */}
                <div className="absolute inset-0 z-0 opacity-20">
                  {/* Connecting lines with animation */}
                  <div className="absolute top-1/4 left-1/4 w-24 h-[1px] bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/4 w-20 h-[1px] bg-gradient-to-l from-amber-400 to-orange-500 animate-pulse delay-300"></div>
                  <div className="absolute bottom-1/3 left-1/3 w-16 h-[1px] bg-gradient-to-r from-orange-400 to-amber-500 animate-pulse delay-500"></div>
                  
                  {/* Animated dots */}
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                  <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping delay-200"></div>
                  <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-amber-600 rounded-full animate-ping delay-400"></div>
                  <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-600"></div>
                  
                  {/* Spark effects */}
                  <div className="absolute top-1/3 right-1/2 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-ping delay-100"></div>
                  <div className="absolute bottom-1/2 left-1/2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping delay-700"></div>
                </div>
                
                {/* Enhanced Navigation Buttons */}
                <div className="space-y-4">
                  {/* Save your Dot button */}
                  <Button
                    onClick={() => {
                      setShowOptions(false);
                      setCaptureMode('text');
                    }}
                    className="w-full h-16 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-xl border-0 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Send className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-lg font-bold">Save your Dot</span>
                        <span className="text-sm opacity-90">Capture thoughts instantly</span>
                      </div>
                    </div>
                    
                    {/* Animated pulse */}
                    <div className="absolute top-2 right-3 w-1 h-1 bg-green-300 rounded-full animate-ping opacity-70"></div>
                  </Button>

                  <Button
                    onClick={() => window.open("https://www.dotspark.in/my-neura", "_blank")}
                    className="w-full h-16 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white rounded-2xl shadow-xl border-0 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-lg font-bold">Open DotSpark App</span>
                        <span className="text-sm opacity-90">Access full neural features</span>
                      </div>
                    </div>
                    
                    {/* Animated spark */}
                    <div className="absolute top-2 right-3 w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-70"></div>
                  </Button>
                  
                  <Button
                    onClick={() => window.open("https://www.dotspark.in/dashboard", "_blank")}
                    className="w-full h-16 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 text-white rounded-2xl shadow-xl border-0 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-lg font-bold">My Neura</span>
                        <span className="text-sm opacity-90">Neural intelligence dashboard</span>
                      </div>
                    </div>
                    
                    {/* Animated neural pulse */}
                    <div className="absolute top-2 right-3 w-1 h-1 bg-orange-300 rounded-full animate-ping opacity-70 delay-300"></div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Active Capture Interface */
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                {captureMode === 'voice' && (
                  <>
                    <div className="flex justify-start mb-4">
                      <Button 
                        onClick={() => {
                          setShowOptions(true);
                          setTextInput('');
                          setIsRecording(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    </div>
                    <div className="text-center space-y-4">
                      <Button
                        onClick={handleVoiceToggle}
                        size="lg"
                        className={cn(
                          "w-24 h-24 rounded-full transition-all duration-300",
                          isRecording 
                            ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse" 
                            : "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        )}
                      >
                        {isRecording ? (
                          <MicOff className="w-8 h-8" />
                        ) : (
                          <Mic className="w-8 h-8" />
                        )}
                      </Button>
                      <p className="text-gray-600 font-medium">
                        {isRecording ? 'Listening... Tap to stop' : 'Tap to start recording'}
                      </p>
                    </div>
                  </>
                )}

                {captureMode === 'text' && (
                  <div className="flex justify-start mb-4">
                    <Button 
                      onClick={() => {
                        setShowOptions(true);
                        setTextInput('');
                        setIsRecording(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  </div>
                )}

                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={captureMode === 'voice' 
                    ? "Your speech will appear here..." 
                    : "Enter your thoughts here"
                  }
                  className="min-h-[120px] text-lg"
                  readOnly={captureMode === 'voice' && isRecording}
                />

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmit}
                    className="w-full h-12"
                    disabled={!textInput.trim()}
                  >
                    Save Dot
                  </Button>
                </div>
                
                <Button
                  onClick={() => window.open("https://www.dotspark.in/dashboard", "_blank")}
                  variant="ghost"
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Access Neura
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Tips */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Your valuable thoughts are stored as connected dots to spark progressive insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}