import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { 
  MessageCircle, 
  Users, 
  Lightbulb, 
  Brain, 
  BookOpen, 
  BarChart2, 
  BrainCog,
  BrainCircuit,
  Download, 
  Smartphone,
  Monitor,
  Share,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarDays,
  Clock,
  Star,
  Zap,
  Target,
  Gauge,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { ContactOptionsDialog } from "@/components/ui/contact-options-dialog";

export default function LandingPage() {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);

  // Query WhatsApp status
  const { data: whatsAppStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/whatsapp/status"],
    retry: false,
  });

  const whatsAppNumber = whatsAppStatus?.phoneNumber || "+1234567890";

  useEffect(() => {
    // Auto-scroll functionality for hero section
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const elements = document.querySelectorAll('.parallax-element');
      elements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        (element as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-amber-50/30 dark:from-slate-950 dark:to-amber-950/10 min-h-screen flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow parallax-element"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow parallax-element" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-float parallax-element"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary/30 rounded-full animate-float-slow parallax-element"></div>
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-primary/15 rounded-full animate-float-slower parallax-element"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="mb-6 flex justify-center lg:justify-start">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  Neural Intelligence Platform
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block">Meet Your</span>
                <span className="gradient-heading">Neural Mirror</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
                DotSpark reflects your unique thinking patterns, adapting and evolving with every interaction to become your personalized AI companion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/25"
                  onClick={() => setContactDialogOpen(true)}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 border-2"
                  onClick={() => setInstallDialogOpen(true)}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Install Web App
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">5K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">50+</div>
                  <div className="text-sm text-muted-foreground">Industries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">100K+</div>
                  <div className="text-sm text-muted-foreground">Conversations</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-card/50 backdrop-blur-sm border rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <Link href="/dotspark-tuning" className="text-2xl font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer">
                      DotSpark
                    </Link>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Your Neural Assistant</h3>
                  <p className="text-muted-foreground">Adapts to your thinking patterns</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Learning your preferences</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Brain className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm">Analyzing thought patterns</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="text-sm">Generating insights</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-secondary" 
                  onClick={() => setContactDialogOpen(true)}
                >
                  Experience DotSpark
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community section with ThinQers branding */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Thin</span>
                <span className="relative inline-block mx-1">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent border border-primary/40 px-1 rounded">Q</span>
                </span>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ers</span>
              </span> Community
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with professionals who think deeper, question smarter, and solve problems with enhanced cognitive capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">5,000+</h3>
                <p className="text-muted-foreground">Active professionals enhancing their cognitive capabilities daily</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">100K+</h3>
                <p className="text-muted-foreground">Neural conversations and cognitive insights generated</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">50+</h3>
                <p className="text-muted-foreground">Industry domains with specialized cognitive enhancement</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Status and Progress Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Your <span className="gradient-heading">Neural Journey</span></h2>
              <p className="text-xl text-muted-foreground">Track your cognitive enhancement progress</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* WhatsApp Status */}
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">WhatsApp Integration</h3>
                      <p className="text-sm text-muted-foreground">Direct neural conversation access</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Connection Status</span>
                      {statusLoading ? (
                        <Badge variant="outline">Checking...</Badge>
                      ) : whatsAppStatus?.isRegistered ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Setup Required
                        </Badge>
                      )}
                    </div>
                    
                    <Progress value={whatsAppStatus?.isRegistered ? 100 : 0} className="h-2" />
                    
                    <div className="text-xs text-muted-foreground">
                      {whatsAppStatus?.isRegistered 
                        ? "Ready for neural conversations via WhatsApp"
                        : "Send 'DOTSPARKSOCIAL' to activate your connection"
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DotSpark Activation Status */}
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">DotSpark Neural Core</h3>
                      <p className="text-sm text-muted-foreground">Your personalized AI system</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Activation Status</span>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        <Zap className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    
                    <Progress value={85} className="h-2" />
                    
                    <div className="text-xs text-muted-foreground">
                      Neural patterns learning and adapting to your style
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Progress Completion */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Setup Completion</h3>
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                  {whatsAppStatus?.isRegistered ? "92%" : "46%"} Complete
                </Badge>
              </div>
              
              <Progress 
                value={whatsAppStatus?.isRegistered ? 92 : 46} 
