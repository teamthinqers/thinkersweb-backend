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
  ArrowLeft,
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
            <div className="mx-auto w-24 h-24 flex items-center justify-center">
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
              <p className="text-gray-600">Capture your Thoughts/Insights as Dots instantly</p>
            </div>
          </div>

          {/* Main Interface */}
          {showOptions ? (
            /* Initial Options */
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <p className="text-center text-gray-700 font-medium">
                  How would you like to capture your Dots?
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
                    className="w-full h-14 text-lg bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white"
                  >
                    <Type className="w-6 h-6 mr-3" />
                    Text
                  </Button>
                </div>
                
                <div className="pt-4 border-t space-y-3">
                  <Button
                    onClick={handleOpenFullApp}
                    variant="outline"
                    className="w-full h-12 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 text-amber-800 hover:text-amber-900 font-medium transition-all duration-200 active:bg-amber-100"
                  >
                    <Globe className="w-5 h-5 mr-3 text-amber-700" />
                    <div className="text-left">
                      <div className="text-sm">Open DotSpark App</div>
                      <div className="text-xs text-amber-600">Access full neural features</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => {
                      // Navigate to dashboard
                      window.location.href = '/';
                    }}
                    variant="outline"
                    className="w-full h-12 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 text-amber-800 hover:text-amber-900 font-medium transition-all duration-200 active:bg-amber-100"
                  >
                    <Brain className="w-5 h-5 mr-3 text-amber-700" />
                    <div className="text-left">
                      <div className="text-sm">My Neura</div>
                      <div className="text-xs text-amber-600">View neural insights & settings</div>
                    </div>
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
                    : "Type your thoughts here..."
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
                  onClick={() => {
                    // Navigate to dashboard
                    window.location.href = '/';
                  }}
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