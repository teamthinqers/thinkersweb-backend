import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import { BrainCircuit, TrendingUp, Network, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks/useTags";

const Insights: React.FC = () => {
  const { data: frequencyData, isLoading: loadingFrequency } = useQuery({
    queryKey: ["/api/analytics/frequency"],
  });

  const { data: categoryData, isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/analytics/categories"],
  });

  const { data: insights, isLoading: loadingInsights } = useQuery({
    queryKey: ["/api/insights"],
  });

  const { tags } = useTags(true);

  // Prepare tag data for the radar chart
  const tagData = tags
    ?.filter(tag => tag.count && tag.count > 0)
    .slice(0, 6)
    .map(tag => ({
      subject: tag.name,
      A: tag.count,
      fullMark: Math.max(...(tags?.map(t => t.count || 0) || [1])),
    })) || [];

  // Generate some connection data for the scatter chart
  const connectionData = React.useMemo(() => {
    if (!tags || tags.length < 5) return [];
    
    const topTags = tags.slice(0, 5);
    const connections = [];
    
    for (let i = 0; i < topTags.length; i++) {
      const tag = topTags[i];
      connections.push({
        x: i * 100 + 100,
        y: tag.count || 1,
        z: tag.count || 1,
        name: tag.name,
      });
    }
    
    return connections;
  }, [tags]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <p className="text-gray-600">Discover patterns and connections in your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm overflow-hidden border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BrainCircuit className="text-primary mr-2 h-5 w-5" />
              Learning Focus Areas
            </h2>
            
            {loadingInsights ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-gray-500">Loading insights...</p>
              </div>
            ) : insights?.focusAreas && insights.focusAreas.length > 0 ? (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <p className="mb-3 font-medium text-gray-700">Your recent learning has been focused on:</p>
                <ul className="list-disc pl-5 space-y-2">
                  {insights.focusAreas.map((area: string, index: number) => (
                    <li key={index} className="text-gray-700">{area}</li>
                  ))}
                </ul>
                
                {insights.recommendations && insights.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-indigo-200">
                    <p className="font-medium text-gray-700 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                      Recommendation:
                    </p>
                    <p className="mt-1 text-gray-600">{insights.recommendations[0]}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-gray-500 mb-2">Not enough data to generate insights.</p>
                <p className="text-sm text-gray-400">Add more entries to see your learning focus areas.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="text-primary mr-2 h-5 w-5" />
              Learning Frequency
            </h2>
            
            {loadingFrequency ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : frequencyData && frequencyData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequencyData}>
                    <XAxis 
                      dataKey="week" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`${value} entries`, 'Count']}
                      labelFormatter={(label) => `Week of ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-gray-500 mb-2">No frequency data available yet.</p>
                <p className="text-sm text-gray-400">Start adding entries to see your learning patterns.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm overflow-hidden border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Network className="text-primary mr-2 h-5 w-5" />
              Topic Distribution
            </h2>
            
            {loadingCategories ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : categoryData && categoryData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="category"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || `hsl(var(--chart-${(index % 5) + 1}))`} 
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value: any) => [`${value} entries`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-gray-500 mb-2">No category data available yet.</p>
                <p className="text-sm text-gray-400">Categorize your entries to see distribution.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Network className="text-primary mr-2 h-5 w-5" />
              Tag Frequency
            </h2>
            
            {!tags || tags.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-gray-500 mb-2">No tag data available yet.</p>
                <p className="text-sm text-gray-400">Add tags to your entries to see patterns.</p>
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius={80} data={tagData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar 
                      name="Tag Usage" 
                      dataKey="A" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.4} 
                    />
                    <Tooltip formatter={(value: any) => [`${value} entries`, 'Usage']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden border border-gray-200 mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Network className="text-primary mr-2 h-5 w-5" />
            Common Learning Connections
          </h2>
          
          {!insights?.recentTags || insights.recentTags.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Not enough data to show connections</p>
              <p className="text-sm text-gray-400">Add more tagged entries to see connections between topics</p>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-md font-medium mb-2">Most frequent topics</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.recentTags.map((tag: any, index: number) => (
                    <Badge 
                      key={index} 
                      variant="tag" 
                      className="flex items-center gap-1"
                    >
                      {tag.name}
                      <span className="bg-gray-200 text-gray-700 rounded-full px-1.5 text-xs">
                        {tag.count}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium mb-2">Recent categories</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.recentCategories.map((category: any, index: number) => (
                    <Badge 
                      key={index} 
                      variant={
                        category.name.toLowerCase() === "professional" ? "professional" :
                        category.name.toLowerCase() === "personal" ? "personal" :
                        category.name.toLowerCase() === "health" ? "health" :
                        category.name.toLowerCase() === "finance" ? "finance" :
                        "default"
                      } 
                      className="flex items-center gap-1"
                    >
                      {category.name}
                      <span className="bg-white bg-opacity-20 rounded-full px-1.5 text-xs">
                        {category.count}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
