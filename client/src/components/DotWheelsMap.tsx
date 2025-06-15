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

  // Generate 18 example dots for preview if no dots exist
  const exampleDots = dots.length === 0 ? [
    // Wheel 1 - Professional Growth
    { id: 101, summary: "Leadership skills require emotional intelligence and clear communication", anchor: "Meeting with team lead about project roadmap", pulse: "focused", sourceType: 'text' as const, createdAt: '2024-06-14T10:30:00Z', wheelId: 1, positionX: 150, positionY: 200 },
    { id: 102, summary: "Data visualization tells stories that numbers alone cannot express", anchor: "Dashboard design workshop insights", pulse: "inspired", sourceType: 'voice' as const, createdAt: '2024-06-14T14:15:00Z', wheelId: 1, positionX: 280, positionY: 180 },
    { id: 103, summary: "Feedback loops accelerate learning when applied consistently", anchor: "Performance review discussion takeaways", pulse: "motivated", sourceType: 'text' as const, createdAt: '2024-06-13T16:45:00Z', wheelId: 1, positionX: 320, positionY: 240 },
    { id: 104, summary: "Cross-functional collaboration breaks down silos effectively", anchor: "Marketing and engineering alignment meeting", pulse: "excited", sourceType: 'voice' as const, createdAt: '2024-06-13T11:20:00Z', wheelId: 1, positionX: 180, positionY: 300 },
    { id: 105, summary: "Problem-solving frameworks provide structure to complex challenges", anchor: "Design thinking workshop methodology", pulse: "curious", sourceType: 'text' as const, createdAt: '2024-06-12T09:10:00Z', wheelId: 1, positionX: 350, positionY: 160 },
    { id: 106, summary: "Time management starts with energy management and priority clarity", anchor: "Productivity system optimization session", pulse: "calm", sourceType: 'voice' as const, createdAt: '2024-06-12T15:30:00Z', wheelId: 1, positionX: 220, positionY: 280 },
    { id: 107, summary: "Innovation emerges from connecting disparate ideas and perspectives", anchor: "Brainstorming session for new product features", pulse: "creative", sourceType: 'text' as const, createdAt: '2024-06-11T13:45:00Z', wheelId: 1, positionX: 400, positionY: 220 },
    { id: 108, summary: "Documentation quality directly impacts team knowledge transfer", anchor: "Technical writing standards discussion", pulse: "determined", sourceType: 'voice' as const, createdAt: '2024-06-11T10:15:00Z', wheelId: 1, positionX: 120, positionY: 250 },
    { id: 109, summary: "Customer empathy drives product decisions more than data alone", anchor: "User interview insights and feedback analysis", pulse: "empathetic", sourceType: 'text' as const, createdAt: '2024-06-10T14:00:00Z', wheelId: 1, positionX: 380, positionY: 300 },

    // Wheel 2 - Personal Development
    { id: 201, summary: "Mindfulness practice improves decision-making under pressure", anchor: "Morning meditation session reflection", pulse: "peaceful", sourceType: 'voice' as const, createdAt: '2024-06-14T07:00:00Z', wheelId: 2, positionX: 600, positionY: 150 },
    { id: 202, summary: "Reading diverse perspectives expands mental models significantly", anchor: "Philosophy book discussion with friend", pulse: "thoughtful", sourceType: 'text' as const, createdAt: '2024-06-13T20:30:00Z', wheelId: 2, positionX: 720, positionY: 200 },
    { id: 203, summary: "Physical exercise enhances cognitive performance and creativity", anchor: "Post-workout mental clarity observation", pulse: "energized", sourceType: 'voice' as const, createdAt: '2024-06-13T06:45:00Z', wheelId: 2, positionX: 680, positionY: 280 },
    { id: 204, summary: "Gratitude practice shifts focus from scarcity to abundance", anchor: "Evening journaling about positive moments", pulse: "grateful", sourceType: 'text' as const, createdAt: '2024-06-12T21:00:00Z', wheelId: 2, positionX: 550, positionY: 320 },
    { id: 205, summary: "Learning new skills requires embracing discomfort and persistence", anchor: "Guitar practice session breakthrough moment", pulse: "proud", sourceType: 'voice' as const, createdAt: '2024-06-12T19:15:00Z', wheelId: 2, positionX: 780, positionY: 160 },
    { id: 206, summary: "Social connections provide support and diverse viewpoints", anchor: "Coffee conversation with mentor", pulse: "supported", sourceType: 'text' as const, createdAt: '2024-06-11T16:30:00Z', wheelId: 2, positionX: 620, positionY: 250 },
    { id: 207, summary: "Reflection transforms experience into wisdom and growth", anchor: "Weekly review of accomplishments and lessons", pulse: "reflective", sourceType: 'voice' as const, createdAt: '2024-06-11T18:45:00Z', wheelId: 2, positionX: 750, positionY: 300 },
    { id: 208, summary: "Goal setting works best with specific timelines and metrics", anchor: "Quarterly planning session for personal objectives", pulse: "focused", sourceType: 'text' as const, createdAt: '2024-06-10T12:00:00Z', wheelId: 2, positionX: 580, positionY: 180 },
    { id: 209, summary: "Curiosity drives continuous learning and personal evolution", anchor: "Discovery of new podcast on behavioral psychology", pulse: "intrigued", sourceType: 'voice' as const, createdAt: '2024-06-10T17:20:00Z', wheelId: 2, positionX: 700, positionY: 350 }
  ] : [];

  const dotsToDisplay = dots.length > 0 ? dots : exampleDots;

  // Generate random positions for dots across larger canvas
  const dotsWithPositions = dotsToDisplay.map(dot => ({
    ...dot,
    positionX: dot.positionX ?? Math.floor(Math.random() * 1800) + 100,
    positionY: dot.positionY ?? Math.floor(Math.random() * 1300) + 100
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
      
      {/* Smooth scrollable map container with enhanced navigation */}
      <div className="relative w-full h-96 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 scroll-smooth custom-scrollbar">
        <style dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar {
              scroll-behavior: smooth;
              scrollbar-width: thin;
              scrollbar-color: rgba(251, 191, 36, 0.5) transparent;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(251, 191, 36, 0.6);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(251, 191, 36, 0.8);
            }
          `
        }} />
        
        {/* Enhanced grid canvas with larger area for smooth navigation */}
        <div 
          className="relative"
          style={{ 
            width: '2000px', 
            height: '1500px',
            backgroundImage: `
              radial-gradient(circle at 20px 20px, rgba(251, 191, 36, 0.1) 2px, transparent 2px),
              linear-gradient(90deg, rgba(251, 191, 36, 0.05) 1px, transparent 1px),
              linear-gradient(rgba(251, 191, 36, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 40px 40px, 40px 40px'
          }}
        >
          {/* SVG for connections */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            width="2000"
            height="1500"
          >
            {connections.map((connection) => (
              <g key={connection.id}>
                {/* Main dotted line */}
                <line
                  x1={connection.from.x}
                  y1={connection.from.y}
                  x2={connection.to.x}
                  y2={connection.to.y}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  opacity="0.6"
                />
                {/* Subtle glow effect */}
                <line
                  x1={connection.from.x}
                  y1={connection.from.y}
                  x2={connection.to.x}
                  y2={connection.to.y}
                  stroke="rgba(251, 191, 36, 0.3)"
                  strokeWidth="4"
                  strokeDasharray="8,4"
                  opacity="0.3"
                />
              </g>
            ))}
          </svg>
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
                  
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      Open in full view mode
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Enhanced Navigation Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="grid grid-cols-3 gap-1">
              {/* Directional navigation buttons */}
              <div></div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  const container = document.querySelector('.custom-scrollbar');
                  if (container) {
                    container.scrollBy({ top: -200, behavior: 'smooth' });
                  }
                }}
              >
                ↑
              </Button>
              <div></div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  const container = document.querySelector('.custom-scrollbar');
                  if (container) {
                    container.scrollBy({ left: -200, behavior: 'smooth' });
                  }
                }}
              >
                ←
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 bg-amber-100"
                onClick={() => {
                  const container = document.querySelector('.custom-scrollbar');
                  if (container) {
                    container.scrollTo({ 
                      left: 1000, 
                      top: 750, 
                      behavior: 'smooth' 
                    });
                  }
                }}
              >
                ⌂
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  const container = document.querySelector('.custom-scrollbar');
                  if (container) {
                    container.scrollBy({ left: 200, behavior: 'smooth' });
                  }
                }}
              >
                →
              </Button>
              
              <div></div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  const container = document.querySelector('.custom-scrollbar');
                  if (container) {
                    container.scrollBy({ top: 200, behavior: 'smooth' });
                  }
                }}
              >
                ↓
              </Button>
              <div></div>
            </div>
          </div>
        </div>

        {/* Interactive navigation hints */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <span>🖱️ Scroll to explore</span>
            <span>🎯 Click dots to view</span>
            <span>⌂ Use nav controls</span>
          </div>
        </div>
        
        {/* Map overview indicator */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span>Neural Grid: 2000×1500px</span>
          </div>
        </div>
      </div>
    </div>
  );
}