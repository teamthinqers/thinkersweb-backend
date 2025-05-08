import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Brain, Users, BookOpen, Sparkles, BarChart2, MessageCircle, Star, PlusCircle, ArrowRight } from "lucide-react";

const MockDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top notification bar */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-8 border border-primary/20 flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-primary mr-3" />
          <span className="text-sm font-medium">You're viewing a demo dashboard. Sign up to create your own neural extension.</span>
        </div>
        <Button size="sm" variant="default" className="bg-primary text-white hover:bg-primary/90" asChild>
          <Link href="/auth">
            Sign up <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Dashboard header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Your Neural Dashboard</h1>
          <p className="text-muted-foreground">Organize, visualize, and expand your cognitive capabilities</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            <span>Share</span>
          </Button>
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
            <PlusCircle className="h-4 w-4" />
            <span>New Entry</span>
          </Button>
        </div>
      </div>

      {/* Stats and insights cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">+8 since last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cognitive Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground mt-1">Across 12 categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consistency Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground mt-1">Top 15% of users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Advanced</div>
            <p className="text-xs text-muted-foreground mt-1">3 areas of expertise</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Neural Activities</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sample entry cards */}
          {mockEntries.map((entry, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: entry.categoryColor }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.category}</span>
                </div>
                <CardTitle className="text-base">{entry.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                  <div className="flex items-center gap-2">
                    {entry.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Neural network visualization (mock) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Neural Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 h-[200px] flex flex-col items-center justify-center">
            <Brain className="h-12 w-12 text-primary/30 mb-4" />
            <p className="text-center text-muted-foreground">
              Sign up to visualize the interconnections between your learning entries
            </p>
            <Button className="mt-4 gap-2" asChild>
              <Link href="/auth">
                <Sparkles className="h-4 w-4" />
                <span>Activate Neural Visualization</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CTA section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Amplify Your Professional Cognitive Power?
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-6">
          Join innovative professionals who are extending their cognitive capabilities with neural frameworks, 
          achieving breakthrough results and career advancement.
        </p>
        <Button size="lg" variant="default" className="bg-white text-primary hover:bg-white/90" asChild>
          <Link href="/auth">
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

// Mock entry data for the demonstration
const mockEntries = [
  {
    title: "The Impact of AI on Decision-Making Frameworks",
    content: "AI-driven decision support systems are transforming how executives approach strategic planning. The cognitive augmentation provided by these systems enables processing of vast amounts of unstructured data to identify patterns invisible to human analysts.",
    category: "Technology",
    categoryColor: "#4f46e5",
    date: "2 hours ago",
    isFavorite: true
  },
  {
    title: "Neural Network Applications in Market Analysis",
    content: "Recurrent neural networks have shown remarkable effectiveness in predicting market trends by identifying subtle patterns in historical data. These frameworks excel particularly when trained on multi-dimensional datasets incorporating sentiment analysis.",
    category: "Finance",
    categoryColor: "#10b981",
    date: "Yesterday",
    isFavorite: false
  },
  {
    title: "Cognitive Frameworks for Prioritization",
    content: "The Eisenhower Matrix, when enhanced with cognitive mapping techniques, becomes significantly more effective for decision makers. This hybrid approach allows for both urgency and systemic impact assessment.",
    category: "Productivity",
    categoryColor: "#f59e0b",
    date: "3 days ago",
    isFavorite: true
  }
];

export default MockDashboard;