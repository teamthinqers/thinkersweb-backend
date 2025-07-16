// Dashboard component - Fixed version
import React, { useState, useEffect, useRef } from 'react';
import { Brain, ArrowLeft, Search, History, Info, Settings, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DotFullView from '@/components/DotFullView';
import WheelFullView from '@/components/WheelFullView';
import DotFlashCard from '@/components/DotFlashCard';
import WheelFlashCard from '@/components/WheelFlashCard';

interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId: string;
  timestamp: Date;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai';
  voiceData?: {
    summaryVoiceUrl?: string;
    anchorVoiceUrl?: string;
    pulseVoiceUrl?: string;
  } | null;
}

interface Wheel {
  id: string;
  name: string;
  heading?: string;
  purpose?: string;
  timeline?: string;
  category: string;
  color: string;
  dots: Dot[];
  connections: string[];
  position: { x: number; y: number };
  parentWheelId?: string;
  createdAt?: Date;
}

interface DashboardProps {
  wheels?: Wheel[];
  dots?: Dot[];
  setViewFullWheel?: (wheelId: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  wheels = [], 
  dots = [], 
  setViewFullWheel = () => {} 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
  const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
  const [showRecentFilter, setShowRecentFilter] = useState(false);
  const [recentDotsCount, setRecentDotsCount] = useState(4);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const filteredDots = dots.filter(dot =>
    dot.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dot.anchor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dot.pulse.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dot.oneWordSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-600" />
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="/dotspark-logo-icon.jpeg" 
                alt="DotSpark" 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Brain className="w-5 h-5 text-amber-500" />
                  My DotSpark Neura
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Enter keywords to search for a Dot"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2 border-amber-200 focus:border-amber-400 bg-white/90 backdrop-blur"
          />
        </div>

        {/* Recent Dots Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowRecentFilter(!showRecentFilter)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            <History className="w-4 h-4" />
            Recent Dots
          </button>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">
              Search Results ({filteredDots.length})
            </h3>
            {filteredDots.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-lg border-2 border-amber-200">
                <p className="text-amber-700">No dots found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDots.map((dot) => (
                  <div
                    key={dot.id}
                    onClick={() => setViewFullDot(dot)}
                    className="bg-white border-2 border-amber-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${
                          dot.sourceType === 'voice' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {dot.sourceType}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700 text-xs">
                          {dot.pulse}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-lg text-amber-800 border-b border-amber-200 pb-2 mb-3">
                        {dot.oneWordSummary}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {dot.summary}
                      </p>
                      <div className="text-xs text-amber-600 mt-2 font-medium">
                        Click for full view
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dot Wheels Map */}
        <div className="bg-white rounded-lg border-2 border-amber-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-amber-800">Dot Wheels Map</h3>
              <Info className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex gap-2">
              <button className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-sm font-medium">
                Total Dots: {dots.length}
              </button>
              <button className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-sm font-medium">
                Total Wheels: {wheels.length}
              </button>
            </div>
          </div>
          
          {dots.length === 0 && wheels.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                <p className="text-lg font-semibold text-amber-800 mb-2">Start saving your Dots to get a similar map</p>
                <p className="text-sm text-amber-600">Your dots will appear here as an interactive map</p>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center">
              <p className="text-amber-700">Interactive map visualization coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {viewFullDot && (
        <DotFullView 
          dot={viewFullDot} 
          onClose={() => setViewFullDot(null)}
          onDelete={(dotId) => {
            setViewFullDot(null);
            window.location.reload();
          }}
        />
      )}

      {selectedWheel && (
        <WheelFullView 
          wheelId={selectedWheel}
          onClose={() => setSelectedWheel(null)}
          wheels={wheels}
          dots={dots}
        />
      )}
    </div>
  );
};

export default Dashboard;