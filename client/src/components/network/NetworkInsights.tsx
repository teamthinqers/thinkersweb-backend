import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Loader2, TrendingUp, Users, BookOpen, BrainCircuit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function NetworkInsights() {
  // Fetch network insights data
  const { data: networkInsights, isLoading } = useQuery({
    queryKey: ["/api/network/insights"],
    queryFn: async () => {
      const response = await fetch("/api/network/insights");
      if (!response.ok) throw new Error("Failed to fetch network insights");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no shared entries are available yet
  if (!networkInsights || !networkInsights.sharedEntriesCount || networkInsights.sharedEntriesCount === 0) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Network Insights</CardTitle>
          <CardDescription>
            Discover trends and patterns from your learning network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No shared entries yet</h3>
            <p className="text-muted-foreground max-w-md">
              Connect with other learners and share entries to see network insights. 
              As your network grows, you'll discover patterns and trends from 
              collated learning experiences.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for charts
  const topCategoriesData = (networkInsights.topCategories || []).map(category => ({
    name: category.name,
    value: category.count,
    color: category.color || "#6366f1",
  }));

  const topTagsData = (networkInsights.topTags || []).map(tag => ({
    name: tag.name,
    value: tag.count,
  }));

  const learningTrendsData = networkInsights.learningTrends || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network Insights</h2>
          <p className="text-muted-foreground">
            Discover trends and patterns from your learning network
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{networkInsights.connectionCount || 0} Connections</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{networkInsights.sharedEntriesCount || 0} Shared Entries</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Top Learning Areas</CardTitle>
            <CardDescription>Most common categories in your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {topCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Top Tags</CardTitle>
            <CardDescription>Most popular tags in shared entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTagsData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Learning Trends</CardTitle>
            <CardDescription>Entry frequency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={learningTrendsData}>
                  <XAxis dataKey="week" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} entries`, 'Count']}
                    labelFormatter={(label) => `Week of ${label}`}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valuable Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            <span>Network Learning Discoveries</span>
          </CardTitle>
          <CardDescription>
            Insights and patterns derived from your learning network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="topics">
            <TabsList className="mb-4">
              <TabsTrigger value="topics">Popular Topics</TabsTrigger>
              <TabsTrigger value="connections">Connection Insights</TabsTrigger>
              <TabsTrigger value="patterns">Learning Patterns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="topics">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Hot Topics in Your Network</h3>
                <div className="flex flex-wrap gap-2">
                  {(networkInsights.trendingTopics || []).map((topic, index) => (
                    <Badge key={index} className="py-1.5">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {topic}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  These topics represent the most active areas of learning and discussion in your network.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="connections">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connection Insights</h3>
                <ul className="space-y-2">
                  {(networkInsights.connectionInsights || []).map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary text-xl leading-tight">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="patterns">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Learning Patterns</h3>
                <ul className="space-y-2">
                  {(networkInsights.learningPatterns || []).map((pattern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary text-xl leading-tight">•</span>
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground pt-2">
                  These patterns represent common learning approaches and behaviors observed across your network.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}