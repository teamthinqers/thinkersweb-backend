import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Share, 
  BookOpen, 
  TrendingUp, 
  BarChart2, 
  PieChart as PieChartIcon,
  List,
  MessageSquare
} from "lucide-react";

interface NetworkInsightsData {
  connectionCount: number;
  sharedEntriesCount: number;
  entriesSharedByUserCount: number;
  topCategories: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  topTags: Array<{
    name: string;
    count: number;
  }>;
  learningTrends: Array<{
    week: string;
    count: number;
  }>;
  trendingTopics: string[];
  connectionInsights: string[];
  learningPatterns: string[];
}

export default function NetworkInsights() {
  const { data, isLoading, error } = useQuery<NetworkInsightsData>({
    queryKey: ["/api/network/insights"],
    queryFn: async () => {
      const response = await fetch("/api/network/insights");
      if (!response.ok) {
        throw new Error("Failed to fetch network insights");
      }
      return response.json();
    }
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load network insights. Please try again later.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Network insights are only available when you have active connections who have shared entries with you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Network Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.connectionCount || 0}</p>
            <p className="text-sm text-muted-foreground">
              Active learning connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Shared With You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.sharedEntriesCount || 0}</p>
            <p className="text-sm text-muted-foreground">
              Learning entries from your network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Share className="h-5 w-5 mr-2 text-primary" />
              You've Shared
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.entriesSharedByUserCount || 0}</p>
            <p className="text-sm text-muted-foreground">
              Entries shared with your connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                Learning Categories
              </CardTitle>
              <CardDescription>
                Most frequent categories in your network
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {data?.topCategories && data.topCategories.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.topCategories}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Entries">
                        {data.topCategories.map((category, index) => (
                          <Cell key={`cell-${index}`} fill={category.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground py-12 text-center">
                  No category data available yet. Connect with more learners to see insights.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Learning Activity
              </CardTitle>
              <CardDescription>Weekly learning trends in your network</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {data?.learningTrends && data.learningTrends.some(item => item.count > 0) ? (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.learningTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Entries" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground py-12 text-center">
                  No trend data available yet. Share and receive more entries to see activity patterns.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Tabs defaultValue="tags">
            <TabsList className="w-full">
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="tags" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                    Top Tags
                  </CardTitle>
                  <CardDescription>
                    Most popular tags in your learning network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.topTags && data.topTags.length > 0 ? (
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.topTags}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                          >
                            {data.topTags.map((tag, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={[
                                  "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"
                                ][index % 5]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-6 text-center">
                      No tag data available yet. Connect with more learners who use tags.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <List className="h-5 w-5 mr-2 text-primary" />
                    Trending Topics
                  </CardTitle>
                  <CardDescription>
                    Topics frequently mentioned in shared entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.trendingTopics && data.trendingTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.trendingTopics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-6 text-center">
                      No topic data available yet. Share more detailed entries to see topics.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Network Insights
                  </CardTitle>
                  <CardDescription>
                    Observations from your learning network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.connectionInsights && data.connectionInsights.length > 0 ? (
                    <ul className="space-y-2 mb-4">
                      {data.connectionInsights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground py-2">No insights available yet.</p>
                  )}

                  <h4 className="text-sm font-medium mt-4 mb-2">Learning Patterns</h4>
                  {data?.learningPatterns && data.learningPatterns.length > 0 ? (
                    <ul className="space-y-2">
                      {data.learningPatterns.map((pattern, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </span>
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground py-2">No learning patterns detected yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36 mb-2" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-60 w-full" />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-60 w-full" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}