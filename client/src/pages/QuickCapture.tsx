import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Type, Send, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export default function QuickCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [captureMode, setCaptureMode] = useState<'voice' | 'text'>('voice');
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
    } else {
      toast({
        title: "Voice capture not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
    }
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
      description: "Your insight has been saved to your neural extension",
    });

    // Clear the input
    setTextInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <img 
              src="/dotspark-pwa-final.png" 
              alt="DotSpark" 
              className="w-12 h-12 rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quick Capture</h1>
              <p className="text-gray-600">Capture your thoughts instantly</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={captureMode === 'voice' ? 'default' : 'outline'}
            onClick={() => setCaptureMode('voice')}
            className="flex-1"
          >
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </Button>
          <Button
            variant={captureMode === 'text' ? 'default' : 'outline'}
            onClick={() => setCaptureMode('text')}
            className="flex-1"
          >
            <Type className="w-4 h-4 mr-2" />
            Text
          </Button>
        </div>

        {/* Capture Interface */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            {captureMode === 'voice' && (
              <div className="text-center space-y-4">
                <Button
                  onClick={handleVoiceToggle}
                  size="lg"
                  className={cn(
                    "w-24 h-24 rounded-full transition-all duration-300",
                    isRecording 
                      ? "bg-red-500 hover:bg-red-600 scale-110" 
                      : "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  )}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
                <p className="text-gray-600">
                  {isRecording ? 'Listening...' : 'Tap to start recording'}
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

            <Button 
              onClick={handleSubmit}
              className="w-full"
              disabled={!textInput.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Capture Thought
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/60">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Quick Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use voice mode for hands-free capture</li>
              <li>• Switch to text for precise input</li>
              <li>• Your thoughts are automatically processed and categorized</li>
              <li>• Access all captures from your main dashboard</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}