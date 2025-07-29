import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, TestTube } from 'lucide-react';

interface AuthModeSelectorProps {
  onSelectMode: (mode: 'production' | 'demo') => void;
}

export function AuthModeSelector({ onSelectMode }: AuthModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Welcome to DotSpark</h1>
          <p className="text-gray-600">Choose your authentication mode</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Production Mode */}
          <Card className="border-2 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-700">Production Mode</CardTitle>
              <Badge variant="default" className="bg-green-100 text-green-800">Recommended</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Sign in with your Google account for full access to all features.
              </p>
              
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Secure Google authentication
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Personal data storage
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Full feature access
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Data privacy protection
                </div>
              </div>
              
              <Button 
                onClick={() => onSelectMode('production')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Use Production Mode
              </Button>
            </CardContent>
          </Card>

          {/* Demo Mode */}
          <Card className="border-2 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="text-center">
              <TestTube className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-700">Demo Mode</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Testing Only</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Try DotSpark without creating an account. Perfect for testing and exploration.
              </p>
              
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  No account required
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Temporary session
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Core features available
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Data not permanently saved
                </div>
              </div>
              
              <Button 
                onClick={() => onSelectMode('demo')}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Try Demo Mode
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Demo mode is for testing only. Your data will not be permanently saved.
          </p>
        </div>
      </div>
    </div>
  );
}