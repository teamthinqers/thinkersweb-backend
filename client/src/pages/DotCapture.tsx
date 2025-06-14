import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Type, 
  Send, 
  Globe,
  Zap,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DotCapture() {
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
            <div className="mx-auto w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-amber-200">
              <img 
                src="/dotspark-pwa-final.png" 
                alt="DotSpark" 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  console.log('Image failed to load, trying fallback');
                  e.currentTarget.src = '/dotspark-logo-icon.jpeg';
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent">DotSpark</h1>
              <p className="text-gray-600">Capture your thoughts/insights as dots instantly</p>
            </div>
          </div>

          {/* Main Interface */}
          {showOptions ? (
            /* Initial Options */
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <p className="text-center text-gray-700 font-medium">
                  How would you like to capture your thoughts?
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleVoiceToggle}
                    className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  >
                    <Mic className="w-6 h-6 mr-3" />
                    Voice
                  </Button>
                  
                  <Button
                    onClick={handleTextMode}
                    variant="outline"
                    className="w-full h-14 text-lg border-2 hover:bg-amber-50"
                  >
                    <Type className="w-6 h-6 mr-3" />
                    Text
                  </Button>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <Button
                    onClick={handleOpenFullApp}
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Open DotSpark App
                  </Button>
                  <Button
                    onClick={() => {}} // Placeholder for now
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    My Neura
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Active Capture Interface */
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                {captureMode === 'voice' && (
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
                )}

                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={captureMode === 'voice' 
                    ? "Your speech will appear here..." 
                    : "Type your thoughts here..."
                  }
                  className="min-h-[120px] text-lg"
                  readOnly={captureMode === 'voice' && isRecording}
                />

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1 h-12"
                    disabled={!textInput.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Save Thought
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowOptions(true);
                      setTextInput('');
                      setIsRecording(false);
                    }}
                    variant="outline"
                    className="h-12 px-4"
                  >
                    <Zap className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  onClick={handleOpenFullApp}
                  variant="ghost"
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Open DotSpark App
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Tips */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              💡 Your thoughts are automatically processed and organized
            </p>
            <p className="text-xs text-gray-400">
              Swipe up for more options
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}