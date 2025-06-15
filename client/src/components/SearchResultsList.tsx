import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, FileText, Calendar } from 'lucide-react';
import { Dot } from '@shared/schema';

interface SearchResultsListProps {
  searchResults: Dot[];
  onDotClick: (dot: Dot) => void;
  searchTerm: string;
}

export function SearchResultsList({ searchResults, onDotClick, searchTerm }: SearchResultsListProps) {
  if (!searchTerm.trim()) return null;

  if (searchResults.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No dots found matching "{searchTerm}"</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">
          Search Results ({searchResults.length})
        </h3>
        <p className="text-sm text-gray-500">Found {searchResults.length} dots matching "{searchTerm}"</p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {searchResults.map((dot) => (
          <div
            key={dot.id}
            className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
          >
            <Card className="border-0 shadow-none rounded-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {dot.sourceType === 'voice' ? (
                        <Mic className="w-4 h-4 text-amber-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600" />
                      )}
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          dot.sourceType === 'voice' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {dot.sourceType === 'voice' ? 'Voice' : 'Text'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(dot.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {dot.summary}
                    </h4>
                    
                    {dot.anchor && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {dot.anchor}
                      </p>
                    )}
                    
                    {dot.pulse && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Emotion:</span>
                        <Badge variant="outline" className="text-xs">
                          {dot.pulse}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => onDotClick(dot)}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    Open in full view
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}