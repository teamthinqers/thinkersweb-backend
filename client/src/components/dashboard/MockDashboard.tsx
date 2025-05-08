import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Brain, Users, BookOpen, Sparkles, BarChart2, MessageCircle, Star, PlusCircle, ArrowRight } from "lucide-react";
import MockDashboardHeader from "./MockDashboardHeader";

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

const MockDashboard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MockDashboardHeader />
      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Demo indicator banner */}
        <div className="bg-indigo-600 text-white rounded-lg p-3 mb-6 shadow-md border border-indigo-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-500/30 to-indigo-600/0 animate-pulse"></div>
          <div className="flex items-center justify-center font-medium relative z-10">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>DEMO DASHBOARD</span>
            <Sparkles className="h-4 w-4 ml-2" />
          </div>
          <p className="text-xs text-center text-white/80 mt-1">
            This is a preview of what your neural extension dashboard will look like after signup
          </p>
        </div>
        
        {/* Top notification bar - gamified but simpler */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-8 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center mr-4 shadow-md">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="font-bold">Neural Extension Demo</h3>
                  <div className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
                    97% Efficiency
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Experience elite cognitive performance with your own neural extension</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs bg-black/5 dark:bg-white/5 rounded-full px-3 py-1.5 grid grid-cols-3 gap-1">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-indigo-500" />
                  <span className="font-medium">142</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart2 className="h-3 w-3 text-amber-500" />
                  <span className="font-medium">38</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  <span className="font-medium">Top 5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard header - no buttons */}
        <div className="flex flex-col mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Neural Extension Dashboard <span className="text-sm bg-gray-100 dark:bg-gray-800 text-muted-foreground px-2 py-0.5 rounded ml-2">Preview Mode</span></h1>
            <p className="text-muted-foreground">A preview of how you'll organize, visualize, and expand your cognitive capabilities</p>
          </div>
        </div>

        {/* Brain efficiency metrics */}
        <div className="mb-8 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 rounded-xl p-6 border shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2 flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                Neural Extension Efficiency
              </h2>
              <p className="text-muted-foreground text-sm">Your cognitive amplification is operating at peak capacity</p>
            </div>
            <div className="flex items-center bg-white dark:bg-black rounded-lg p-2 px-4 shadow-sm">
              <div className="mr-2 h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-bold">Active & Learning</span>
            </div>
          </div>
          
          <div className="relative h-7 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-violet-500 rounded-full" style={{ width: "97%" }}></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-end pr-2">
              <span className="text-xs font-bold text-white mr-1">97%</span>
            </div>
          </div>
          <p className="text-xs text-right font-medium text-primary">Brain Efficiency - Professional Domain Excellence</p>
        </div>

        {/* Stats cards - Gamified metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="pb-1 pt-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold tracking-tight">142</div>
                <div className="text-sm font-medium text-emerald-500 ml-2">+28%</div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1"></span>
                <span>Level 4 Knowledge Curator</span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-indigo-500">
            <CardHeader className="pb-1 pt-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium">Content Processed</CardTitle>
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold tracking-tight">312</div>
                <div className="text-sm font-medium text-muted-foreground ml-2 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
                  <span>items</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                <span className="text-indigo-500">218 articles</span> • <span className="text-violet-500">94 books</span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-amber-500">
            <CardHeader className="pb-1 pt-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium">Decision Frameworks</CardTitle>
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold tracking-tight">38</div>
                <div className="text-sm font-medium text-emerald-500 ml-2">+12</div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-3 w-3 ${star <= 4 ? "text-amber-500 fill-amber-500" : "text-muted"}`} />
                  ))}
                </div>
                <span className="ml-1">Pro Strategist</span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-emerald-500">
            <CardHeader className="pb-1 pt-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium">Neural Achievement</CardTitle>
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold tracking-tight">Elite</div>
                <div className="text-sm font-medium text-emerald-500 ml-2">Top 5%</div>
              </div>
              <div className="grid grid-cols-5 gap-1 mt-2">
                <div className="h-1 bg-emerald-500 rounded"></div>
                <div className="h-1 bg-emerald-500 rounded"></div>
                <div className="h-1 bg-emerald-500 rounded"></div>
                <div className="h-1 bg-emerald-500 rounded"></div>
                <div className="h-1 bg-emerald-500/30 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity section - simplified */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent Neural Activities</h2>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Brain-Network Mapping Section */}
        <div className="mb-10 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-6 border shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Map My Brain With My Network
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                DotSpark's unique neural extension maps your professional knowledge with your network's expertise, 
                creating powerful cognitive augmentation that improves pattern recognition and decision-making.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-primary/10 flex flex-col items-center">
                  <div className="text-2xl font-bold text-primary">782</div>
                  <div className="text-xs text-center text-muted-foreground">Neural Connections</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-indigo-500/10 flex flex-col items-center">
                  <div className="text-2xl font-bold text-indigo-500">8</div>
                  <div className="text-xs text-center text-muted-foreground">Knowledge Domains</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-emerald-500/10 flex flex-col items-center">
                  <div className="text-2xl font-bold text-emerald-500">96%</div>
                  <div className="text-xs text-center text-muted-foreground">Knowledge Recall</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-amber-500/10 flex flex-col items-center">
                  <div className="text-2xl font-bold text-amber-500">32%</div>
                  <div className="text-xs text-center text-muted-foreground">Growth Rate</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full" style={{ width: "78%" }}></div>
                </div>
                <span className="text-xs font-medium">78%</span>
              </div>
              
              <p className="text-xs text-muted-foreground italic">
                "When your neural extension maps to your network, cognitive abilities improve by an average of 43% in decision-making scenarios."
              </p>
            </div>
            
            <div className="lg:w-1/2 relative min-h-[200px] flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-lg overflow-hidden">
              <div className="absolute inset-0 opacity-70">
                {/* Neural nodes */}
                <div className="absolute top-1/4 left-1/4 h-4 w-4 rounded-full bg-primary animate-pulse"></div>
                <div className="absolute top-1/3 right-1/3 h-5 w-5 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
                <div className="absolute bottom-1/4 right-1/4 h-3 w-3 rounded-full bg-emerald-500 animate-pulse delay-300"></div>
                <div className="absolute bottom-1/3 left-1/3 h-4 w-4 rounded-full bg-amber-500 animate-pulse delay-500"></div>
                <div className="absolute top-1/2 left-1/2 h-6 w-6 rounded-full bg-violet-500 animate-pulse delay-700"></div>
                
                {/* Neural connections */}
                <div className="absolute top-1/4 left-1/4 w-[30%] h-[1px] bg-primary transform rotate-30 origin-left"></div>
                <div className="absolute top-1/3 right-1/3 w-[25%] h-[1px] bg-indigo-500 transform -rotate-15 origin-left"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[1px] bg-emerald-500 transform rotate-45 origin-right"></div>
                <div className="absolute bottom-1/3 left-1/3 w-[35%] h-[1px] bg-amber-500 transform -rotate-30 origin-right"></div>
                <div className="absolute top-1/2 left-1/2 w-[20%] h-[1px] bg-violet-500 transform rotate-60 origin-bottom"></div>
              </div>
              
              <div className="relative z-10 p-4 bg-white/80 dark:bg-gray-900/80 rounded-lg shadow-lg text-center">
                <h3 className="font-semibold mb-2">Neural Network Visualization</h3>
                <p className="text-xs text-muted-foreground">Real-time cognitive map of your extended neural network</p>
                <Link href="/auth" className="mt-3 text-xs text-primary hover:underline inline-flex items-center">
                  <span>Unlock Full Visualization</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="text-center py-8 px-4 mb-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-xl border border-primary/10">
          <h2 className="text-xl font-bold mb-3">Ready to Extend Your Cognitive Capabilities?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who have enhanced their decision-making and knowledge retention with their own neural extension.
          </p>
          <Button asChild className="px-8 py-6 rounded-lg shadow-md bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-none">
            <Link href="/auth">
              <span className="text-lg font-medium">Get Your Neural Extension</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MockDashboard;