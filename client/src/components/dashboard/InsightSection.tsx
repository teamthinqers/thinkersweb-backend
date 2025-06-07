import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const InsightSection: React.FC = () => {
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['/api/insights']
  });

  if (isLoading) {
    return (
      <Card className="mb-8 shadow-sm overflow-hidden border border-gray-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BrainCircuit className="text-primary mr-2 h-5 w-5" />
            Personal Insights
          </h2>
          <div className="text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p>Loading your personalized insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 shadow-sm overflow-hidden border border-gray-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BrainCircuit className="text-primary mr-2 h-5 w-5" />
            Personal Insights
          </h2>
          <div className="text-gray-600 bg-red-50 p-4 rounded-lg border border-red-100">
            <p>Unable to load insights. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 shadow-sm overflow-hidden border border-gray-200">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <BrainCircuit className="text-primary mr-2 h-5 w-5" />
          Personal Insights
        </h2>
        <div className="text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-100">
          <p className="mb-2 font-medium">Based on your recent entries, you seem to be focusing on:</p>
          <ul className="list-disc pl-5 space-y-1">
            {insights?.focusAreas && insights.focusAreas.length > 0 ? (
              insights.focusAreas.map((area: string, index: number) => (
                <li key={index}>{area}</li>
              ))
            ) : (
              <li>Add more entries to see focus areas here</li>
            )}
          </ul>
          {insights?.recommendations && insights.recommendations.length > 0 && (
            <p className="mt-2 text-sm">{insights.recommendations[0]}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightSection;
