import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Plus, 
  ArrowRight, 
  CheckCircle,
  Share,
  Home
} from 'lucide-react';
import { Link } from 'wouter';

export default function DotInstall() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPWASupported, setIsPWASupported] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    setIsAndroid(/Android/.test(userAgent));
    setIsPWASupported('serviceWorker' in navigator);
  }, []);

  const handleInstallDot = () => {
    // Open the standalone dot capture app
    window.open('/quick-capture?standalone=true', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <img 
              src="/dotspark-pwa-final.png" 
              alt="Dot" 
              className="w-16 h-16 rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Install Your Dot</h1>
              <p className="text-gray-600">Add a dedicated capture icon to your home screen</p>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Your Personal Dot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
              <img 
                src="/dotspark-pwa-final.png" 
                alt="Dot" 
                className="w-12 h-12 rounded-full shadow-md"
              />
              <div>
                <p className="font-semibold text-gray-900">Capture Dot</p>
                <p className="text-sm text-gray-600">Tap anywhere to save thoughts</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-white/60 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-600">Voice Capture</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-600">Text Input</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-600">Auto Save</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation Instructions */}
        {isIOS && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="w-5 h-5" />
                iOS Installation
                <Badge variant="secondary">iPhone/iPad</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Open Dot Capture</p>
                    <p className="text-sm text-gray-600">Tap the button below to open your Dot</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Tap Share Button</p>
                    <p className="text-sm text-gray-600">Look for the share icon in Safari's toolbar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Select "Add to Home Screen"</p>
                    <p className="text-sm text-gray-600">Choose the option to add to your home screen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">Confirm Installation</p>
                    <p className="text-sm text-gray-600">Name it "Dot" and tap "Add"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isAndroid && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Android Installation
                <Badge variant="secondary">Android</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Open Dot Capture</p>
                    <p className="text-sm text-gray-600">Tap the button below to open your Dot</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Look for Install Banner</p>
                    <p className="text-sm text-gray-600">Chrome will show an "Add to Home screen" prompt</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Or Use Menu</p>
                    <p className="text-sm text-gray-600">Tap menu (⋮) → "Add to Home screen"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">Confirm Installation</p>
                    <p className="text-sm text-gray-600">Name it "Dot" and tap "Add"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Launch Button */}
        <Card className="mb-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6 text-center">
            <Button
              onClick={handleInstallDot}
              size="lg"
              className="bg-white text-amber-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Open Dot Capture
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="mt-3 text-amber-100">
              This will open your dedicated Dot capture app
            </p>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-white/60">
          <CardHeader>
            <CardTitle>Why Install Your Dot?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Instant access from your home screen</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>No need to open the main DotSpark app</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Optimized for quick thought capture</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Works offline for later sync</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}