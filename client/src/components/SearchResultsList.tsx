import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, FileText, Calendar } from 'lucide-react';

interface Dot {
  id: number;
  summary: string;
  anchor: string;
  pulse: string;
  sourceType: 'voice' | 'text';
  originalAudioBlob?: string;
  transcriptionText?: string;
  createdAt: string;
}

interface SearchResultsListProps {
  searchResults: Dot[];
  onDotClick: (dot: Dot) => void;
  searchTerm: string;
}

export function SearchResultsList({ searchResults, onDotClick, searchTerm }: SearchResultsListProps) {
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Search Results ({searchResults.length} dots found)
      </h3>
      
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {searchResults.map((dot) => (
            <Card 
              key={dot.id} 
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-amber-300"
              onClick={() => onDotClick(dot)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {dot.sourceType === 'voice' ? (
                      <Mic className="w-4 h-4 text-amber-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      {highlightText(dot.summary, searchTerm)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(dot.createdAt).toLocaleDateString()}
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          dot.sourceType === 'voice' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {dot.sourceType}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {dot.pulse}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-xs text-gray-400 font-medium">
                    Click to open
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}