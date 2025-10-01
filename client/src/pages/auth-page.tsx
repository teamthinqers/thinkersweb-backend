import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Brain, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Define form schemas
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  // Use clean authentication system
  const { user, loginWithGoogle } = useAuth();
  
  // Get redirect path from URL if any
  const getRedirectPath = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        setLocation(`/${redirect}`);
      } else {
        // Default redirect to dashboard after login
        setLocation('/dashboard');
      }
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      getRedirectPath();
    }
  }, [user]);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({
          title: "Login successful", 
          description: "Welcome back to DotSpark!",
        });
        getRedirectPath();
      } else {
        const error = await response.text();
        toast({
          title: "Login failed",
          description: error || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Welcome to DotSpark! You can now login.",
        });
        // Switch to login tab after successful registration
        document.querySelector('[data-tab="login"]')?.dispatchEvent(
          new Event("click", { bubbles: true })
        );
      } else {
        const error = await response.text();
        toast({
          title: "Registration failed",
          description: error || "Username or email already in use",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Google sign in with comprehensive debugging
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      console.log("🚀 [AUTH-PAGE] Starting Google Sign In process from auth page");
      console.log("🔍 [AUTH-PAGE] Current user state:", user ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
      
      // Wait for login to complete before navigation
      console.log("🔄 [AUTH-PAGE] Calling loginWithGoogle from useAuth hook...");
      await loginWithGoogle();
      
      console.log("✅ [AUTH-PAGE] Google login completed successfully");
      
      // Check if user was set correctly after login
      console.log("👤 [AUTH-PAGE] Post-login user check:", user ? {
        email: user.email,
        fullName: (user as any)?.fullName,
        avatarUrl: (user as any)?.avatarUrl
      } : 'STILL NO USER');
      
      // Test backend session immediately after login
      setTimeout(async () => {
        try {
          const response = await fetch('/api/auth/status', { credentials: 'include' });
          const data = await response.json();
          console.log("🔍 [AUTH-PAGE] Post-login backend session check:", {
            authenticated: data.authenticated,
            hasUser: !!data.user,
            userEmail: data.user?.email,
            fullName: data.user?.fullName,
            avatarUrl: data.user?.avatarUrl
          });
        } catch (error) {
          console.error("❌ [AUTH-PAGE] Post-login session check failed:", error);
        }
      }, 1000);
      
      // Navigate to the main DotSpark domain after successful login
      getRedirectPath();
      
    } catch (error) {
      console.error("❌ [AUTH-PAGE] Google sign in error:", error);
      setIsLoading(false);
      
      const errorMessage = error instanceof Error ? error.message : "Could not sign in with Google. Please try again.";
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 flex items-center gap-2"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome to DotSpark</h2>
            <p className="mt-2 text-muted-foreground">
              Your neural chip for limitless learning growth
            </p>
          </div>

          {/* Google Sign In Button */}
          <div className="w-full mb-6">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 h-10 border-gray-300"
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.42-.76-2.94-.76-4.59 0-1.66.28-3.18.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
            <div className="mt-4 flex items-center">
              <div className="flex-grow h-px bg-border"></div>
              <span className="px-3 text-xs text-muted-foreground">OR</span>
              <div className="flex-grow h-px bg-border"></div>
            </div>
          </div>

          {/* Email/Password forms */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-tab="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    ) : (
                      <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Must be at least 6 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    ) : (
                      <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side with branding/marketing */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-50/30 to-orange-50/20 dark:from-amber-950/20 dark:to-orange-950/10 p-10">
        <div className="w-full max-w-2xl mx-auto flex flex-col justify-center">
          <div className="space-y-8">
            {/* Hero Section Content */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-4">
                <img src="/dotspark-logo-icon.png?v=2" alt="DotSpark" className="h-6 w-6 rounded" />
                <span>Introducing DotSpark</span>
              </div>
              
              <div className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                <span className="font-sans tracking-normal text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200">
                  For the OG Thin<span className="relative inline-block px-2 py-1 bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white font-bold rounded-lg shadow-lg border-2 border-amber-500/20">Q</span>ers
                </span>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                Built on inspirations from <span className="font-semibold text-amber-700 dark:text-amber-400">ancient Indian wisdom</span>, 
                to preserve and sharpen your <span className="font-semibold text-amber-700 dark:text-amber-400">Natural Intelligence</span> in an AI Driven World.
              </p>
            </div>

            {/* 3-Step Process */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">
                Setup <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">DotSpark</span> in 3 Simple Steps
              </h2>
              
              <div className="space-y-4">
                {/* Step 1: Sign In */}
                <div className="bg-card/50 border border-amber-200/30 dark:border-amber-800/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/80 text-white font-bold text-sm mr-3">1</div>
                    <h3 className="text-lg font-semibold">Sign In or Register</h3>
                  </div>
                  <p className="text-muted-foreground text-sm ml-11">
                    Create your account to personalize your DotSpark experience.
                  </p>
                </div>

                {/* Step 2: Activate DotSpark */}
                <div className="bg-card/50 border border-orange-200/30 dark:border-orange-800/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/80 text-white font-bold text-sm mr-3">2</div>
                    <h3 className="text-lg font-semibold">Activate the Dot</h3>
                  </div>
                  <p className="text-muted-foreground text-sm ml-11">
                    Configure the Dot settings to capture your valuable thoughts.
                  </p>
                </div>

                {/* Step 3: Install Web App */}
                <div className="bg-card/50 border border-orange-200/30 dark:border-orange-800/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/80 text-white font-bold text-sm mr-3">3</div>
                    <h3 className="text-lg font-semibold">Install Web App</h3>
                  </div>
                  <p className="text-muted-foreground text-sm ml-11">
                    Download the Web App on your mobile for a better experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}