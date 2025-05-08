import React from "react";
import { Card } from "@/components/ui/card";
import { Brain, Users, BookOpen, Sparkles, BarChart2, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const DashboardPreview: React.FC = () => {
  return (
    <div className="bg-background/80 backdrop-blur-sm border rounded-xl shadow-xl overflow-hidden">
      {/* Demo Banner */}
      <div className="bg-primary/90 text-white p-2 text-center text-sm font-medium">
        <Sparkles className="inline-block h-3 w-3 mr-1" /> Neural Extension Dashboard Preview
      </div>
      
      <div className="p-4">
        {/* Main dashboard content - simplified preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Stats Card 1 */}
          <Card className="bg-white/70 dark:bg-black/20 overflow-hidden border p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">Knowledge Entries</div>
                <div className="flex items-baseline mt-1">
                  <div className="text-2xl font-bold tracking-tight">142</div>
                  <div className="text-xs text-emerald-500 ml-2">+28%</div>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
            </div>
          </Card>
          
          {/* Stats Card 2 */}
          <Card className="bg-white/70 dark:bg-black/20 overflow-hidden border p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">Neural Connections</div>
                <div className="flex items-baseline mt-1">
                  <div className="text-2xl font-bold tracking-tight">782</div>
                  <div className="text-xs text-emerald-500 ml-2">+32%</div>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-indigo-500" />
              </div>
            </div>
          </Card>
          
          {/* Stats Card 3 */}
          <Card className="bg-white/70 dark:bg-black/20 overflow-hidden border p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">Neural Achievement</div>
                <div className="flex items-baseline mt-1">
                  <div className="text-2xl font-bold tracking-tight">Elite</div>
                  <div className="text-xs text-emerald-500 ml-2">Top 5%</div>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Brain Network Mapping Preview */}
        <div className="mb-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900">
          <div className="flex items-center mb-2">
            <Users className="h-4 w-4 text-primary mr-2" />
            <div className="text-sm font-bold">Brain Network Mapping</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-2 border border-primary/10 flex flex-col items-center">
              <div className="text-xl font-bold text-primary">8</div>
              <div className="text-xs text-center text-muted-foreground">Knowledge Domains</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-2 border border-indigo-500/10 flex flex-col items-center">
              <div className="text-xl font-bold text-indigo-500">96%</div>
              <div className="text-xs text-center text-muted-foreground">Knowledge Recall</div>
            </div>
          </div>
          
          <div className="relative h-14 overflow-hidden rounded-md bg-background/20 flex items-center justify-center">
            <div className="absolute inset-0 opacity-40">
              {/* Neural nodes and connections */}
              <div className="absolute top-1/4 left-1/4 h-3 w-3 rounded-full bg-primary animate-pulse"></div>
              <div className="absolute top-1/3 right-1/3 h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="absolute top-1/4 left-1/4 w-[40%] h-[1px] bg-primary/50 transform rotate-12 origin-left"></div>
              <div className="absolute top-1/3 right-1/3 w-[30%] h-[1px] bg-indigo-500/50 transform -rotate-12 origin-right"></div>
            </div>
            <span className="text-xs text-muted-foreground relative z-10">Interactive Neural Network Visualization</span>
          </div>
        </div>
        
        {/* Recent Entry Preview */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Recent Neural Learnings</div>
          </div>
          
          <Card className="bg-white/70 dark:bg-black/20 overflow-hidden border p-3">
            <div className="flex items-center gap-1 mb-1">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-xs text-muted-foreground">Technology</span>
              {/* Favorite star */}
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 ml-auto" />
            </div>
            <div className="text-sm font-medium mb-1">The Impact of AI on Decision-Making Frameworks</div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              AI-driven decision support systems are transforming how executives approach strategic planning. The cognitive augmentation provided by these systems enables processing of vast amounts of unstructured data.
            </p>
          </Card>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-5">
          <Button asChild className="bg-gradient-to-r from-primary to-indigo-600 text-white hover:from-primary/90 hover:to-indigo-600/90 shadow-md">
            <Link href="/dashboard">
              <Brain className="mr-2 h-4 w-4" /> View Full Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="text-sm">
            <Link href="/auth">
              Get Your Neural Extension
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;