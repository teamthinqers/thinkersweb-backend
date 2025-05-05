import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, BookOpen, Users, Sparkles, BarChart2, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                Introducing the Learning Repository
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Capture, Connect, <span className="text-primary">Transform</span> Your Learning
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Your personal knowledge management system that turns everyday insights into a powerful learning database through natural conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl">
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-70"></div>
                <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-70"></div>
                <div className="relative bg-card border rounded-xl shadow-2xl overflow-hidden">
                  <div className="border-b px-6 py-4 flex items-center bg-muted/50">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm font-medium ml-auto text-muted-foreground">Chat Interface</div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 bg-muted p-4 rounded-xl">
                        Today I learned that consistency in small daily learning sessions is more effective than occasional cramming.
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Brain className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div className="flex-1 bg-card border p-4 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">I've captured that insight as a learning entry:</p>
                        <h3 className="font-medium">The Power of Daily Learning Habits</h3>
                        <p className="text-sm mt-1">Consistent small sessions produce better results than infrequent long sessions...</p>
                        <div className="flex gap-2 mt-3">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">habit-formation</span>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 text-secondary">learning-science</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">23%</h3>
              <p className="text-muted-foreground">Improvement in retention through spaced repetition</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">3x</h3>
              <p className="text-muted-foreground">Increased application of learnings in daily life</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">78%</h3>
              <p className="text-muted-foreground">Users report better connection between ideas</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">42%</h3>
              <p className="text-muted-foreground">More likely to share insights with others</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform How You Learn</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our conversational approach makes recording and connecting learnings effortless and intuitive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Conversational Capture</h3>
              <p className="text-muted-foreground">
                Simply chat about what you've learned, and AI automatically structures and categorizes your insights.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Knowledge Organization</h3>
              <p className="text-muted-foreground">
                Automatically categorize and tag entries, creating a searchable personal knowledge database.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Barter Learn Network</h3>
              <p className="text-muted-foreground">
                Connect with other learners, share insights, and discover patterns from collective learning.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pattern Recognition</h3>
              <p className="text-muted-foreground">
                Uncover connections between different areas of learning with AI-powered insight generation.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Learning Analytics</h3>
              <p className="text-muted-foreground">
                Track your learning habits, identify trends, and visualize progress across different areas.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Reflection</h3>
              <p className="text-muted-foreground">
                Engage in AI-guided reflection on your learning patterns, helping you grow and adapt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to transform your learning experience
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            {/* Step 1 */}
            <div className="flex-1 max-w-md text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold mb-2">Chat About Your Learning</h3>
              <p className="text-muted-foreground">
                Simply tell the app what you've learned in your own words, just like you're talking to a friend.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex-1 max-w-md text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold mb-2">AI Structures Your Insights</h3>
              <p className="text-muted-foreground">
                The app automatically organizes your learning into structured entries with relevant tags and categories.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex-1 max-w-md text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold mb-2">Discover Patterns & Share</h3>
              <p className="text-muted-foreground">
                Explore connections between your learnings, generate insights, and optionally share with your network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Use Cases */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who Benefits?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how different people transform their learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* User 1 */}
            <div className="bg-card border rounded-xl p-6 shadow-md">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-primary/10 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 7V5c0-1.1.9-2 2-2h2"></path><path d="M17 3h2c1.1 0 2 .9 2 2v2"></path><path d="M21 17v2c0 1.1-.9 2-2 2h-2"></path><path d="M7 21H5c-1.1 0-2-.9-2-2v-2"></path><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path></svg>
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Students</h3>
              <p className="text-muted-foreground mb-4">
                "I used to highlight textbooks and take notes that I never revisited. Now I chat about what I'm learning and can actually see connections between my classes."
              </p>
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium">Key Benefits:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Better retention through organized insights</li>
                  <li>• Discover connections across subjects</li>
                  <li>• Share notes with study groups</li>
                </ul>
              </div>
            </div>

            {/* User 2 */}
            <div className="bg-card border rounded-xl p-6 shadow-md">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-primary/10 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professionals</h3>
              <p className="text-muted-foreground mb-4">
                "I read articles, take courses, and attend webinars constantly. This app helps me retain what matters and apply it to my work."
              </p>
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium">Key Benefits:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Track professional development</li>
                  <li>• Turn insights into actionable strategies</li>
                  <li>• Share knowledge with team members</li>
                </ul>
              </div>
            </div>

            {/* User 3 */}
            <div className="bg-card border rounded-xl p-6 shadow-md">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-primary/10 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lifelong Learners</h3>
              <p className="text-muted-foreground mb-4">
                "I'm curious about everything from astronomy to cooking. This app helps me see surprising connections between my different interests."
              </p>
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium">Key Benefits:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Organize diverse learning interests</li>
                  <li>• Discover interdisciplinary connections</li>
                  <li>• Build a personal knowledge database</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of learners who are capturing, connecting, and sharing knowledge more effectively than ever before.
          </p>
          <Button size="lg" variant="secondary" className="text-primary" asChild>
            <Link href="/dashboard">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 text-muted-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-foreground">Learning Repository</h2>
              <p className="mt-1">Capture, Connect, Transform</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/auth" className="hover:text-primary transition-colors">Sign In</Link>
              <Link href="/network" className="hover:text-primary transition-colors">Network</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Learning Repository. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}