import SharedAuthLayout from '@/components/layout/SharedAuthLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Network } from 'lucide-react';

export default function ThoughtCirclePage() {
  return (
    <SharedAuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                  My Thought Circle
                </h1>
                <p className="text-purple-700/70 text-lg mt-1">
                  Connect with your thinking network
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Thought Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Coming soon - Connect with people who think like you</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-600" />
                  Thought Networks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Coming soon - Visualize your intellectual connections</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SharedAuthLayout>
  );
}
