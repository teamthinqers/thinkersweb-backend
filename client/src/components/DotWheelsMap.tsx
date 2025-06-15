import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, FileText, Volume2 } from 'lucide-react';

interface Dot {
  id: number;
  summary: string;
  anchor: string;
  pulse: string;
  sourceType: 'voice' | 'text';
  originalAudioBlob?: string;
  transcriptionText?: string;
  positionX?: number;
  positionY?: number;
  createdAt: string;
  wheelId?: number;
}

interface Wheel {
  id: string;
  name: string;
  category: string;
  color: string;
  dots: Dot[];
}

interface DotWheelsMapProps {
  wheels: Wheel[];
  dots: Dot[];
  onDotClick: (dot: Dot) => void;
}

export function DotWheelsMap({ wheels, dots, onDotClick }: DotWheelsMapProps) {
  const [selectedDot, setSelectedDot] = useState<number | null>(null);

  // If no dots exist, show preview state
  if (dots.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Your Neural Constellation Awaits</h3>
          <p className="text-gray-600">
            Start saving your Dots to get a similar map with interconnected thoughts and insights
          </p>
        </div>
      </div>
    );
  }

  // Generate random positions for dots if not already set
  const dotsWithPositions = dots.map(dot => ({
    ...dot,
    positionX: dot.positionX || Math.floor(Math.random() * 700) + 50,
    positionY: dot.positionY || Math.floor(Math.random() * 500) + 50
  }));

  // Generate dotted line connections between dots
  const generateConnections = () => {
    const connections = [];
    for (let i = 0; i < dotsWithPositions.length - 1; i++) {
      const currentDot = dotsWithPositions[i];
      const nextDot = dotsWithPositions[i + 1];
      
      connections.push({
        from: { x: currentDot.positionX!, y: currentDot.positionY! },
        to: { x: nextDot.positionX!, y: nextDot.positionY! },
        id: `connection-${currentDot.id}-${nextDot.id}`
      });
    }
    
    // Add some random connections between non-adjacent dots
    for (let i = 0; i < Math.min(3, dotsWithPositions.length); i++) {
      const randomIndex1 = Math.floor(Math.random() * dotsWithPositions.length);
      const randomIndex2 = Math.floor(Math.random() * dotsWithPositions.length);
      
      if (randomIndex1 !== randomIndex2) {
        const dot1 = dotsWithPositions[randomIndex1];
        const dot2 = dotsWithPositions[randomIndex2];
        
        connections.push({
          from: { x: dot1.positionX!, y: dot1.positionY! },
          to: { x: dot2.positionX!, y: dot2.positionY! },
          id: `random-connection-${dot1.id}-${dot2.id}`
        });
      }
    }
    
    return connections;
  };

  const connections = generateConnections();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with stats */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex gap-4">
          <Button variant="outline" size="sm">
            Total Dots: {dots.length}
          </Button>
          <Button variant="outline" size="sm">
            Total Wheels: {wheels.length || 1}
          </Button>
        </div>
      </div>
      
      {/* Scrollable map container */}
      <div className="relative w-full h-96 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        {/* SVG for connections */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          style={{ minWidth: '800px', minHeight: '600px' }}
        >
          {connections.map((connection) => (
            <line
              key={connection.id}
              x1={connection.from.x}
              y1={connection.from.y}
              x2={connection.to.x}
              y2={connection.to.y}
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          ))}
        </svg>
        
        {/* Dots positioned randomly */}
        <div 
          className="relative pointer-events-auto" 
          style={{ minWidth: '800px', minHeight: '600px' }}
        >
          {dotsWithPositions.map((dot) => (
            <div
              key={dot.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                selectedDot === dot.id ? 'ring-4 ring-amber-400 ring-opacity-60' : ''
              }`}
              style={{
                left: `${dot.positionX}px`,
                top: `${dot.positionY}px`
              }}
              onClick={() => {
                setSelectedDot(dot.id);
                setTimeout(() => onDotClick(dot), 100);
              }}
            >
              <Card className="w-48 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    {dot.sourceType === 'voice' ? (
                      <Mic className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {dot.summary}
                      </h4>
                      {dot.pulse && (
                        <Badge variant="outline" className="text-xs">
                          {dot.pulse}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(dot.createdAt).toLocaleDateString()}
                    </span>
                    {dot.sourceType === 'voice' && dot.originalAudioBlob && (
                      <Volume2 className="w-3 h-3 text-amber-600" />
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDotClick(dot);
                    }}
                  >
                    Open in full view
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Draggable hint */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          Drag to explore • Click dots to view
        </div>
      </div>
    </div>
  );
}