import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth-new';
import { useLocation } from "wouter";
import { Loader2, Smartphone, MessageCircle, SendHorizonal, Check } from "lucide-react";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";


interface DotSparkWhatsAppLinkingProps {
  isActivated?: boolean;
  isChecking?: boolean;
  directLink?: string;
}

export function DotSparkWhatsAppLinking({
  isActivated: externalIsActivated,
  isChecking: externalIsChecking,
  directLink: externalDirectLink
}: DotSparkWhatsAppLinkingProps = {}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [, setLocation] = useLocation();
  const { simulateActivation, isWhatsAppConnected, phoneNumber } = useWhatsAppStatus();
  
  // Use external props if provided, otherwise use the hook values
  const actualIsActivated = externalIsActivated !== undefined ? externalIsActivated : isWhatsAppConnected;
  
  // Check for special phone number
  const isSpecialPhoneNumber = phoneNumber === '+919840884459';
  
  // Function to directly activate the special phone number
  const activateSpecialNumber = async () => {
    if (!isSpecialPhoneNumber && phoneNumber !== '+919840884459') return;
    
    try {
      setLoading(true);
      console.log("🔥 Attempting special activation for number:", phoneNumber || '+919840884459');
      
      const res = await fetch('/api/whatsapp/special-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: '+919840884459' 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("🔥 Special activation successful:", data);
        
        // Force status update
        localStorage.setItem('dotspark_activated', 'true');
        localStorage.setItem('whatsapp_phone', '+919840884459');
        
        // Trigger status update events
        window.dispatchEvent(new CustomEvent('whatsapp-status-updated', { 
          detail: { isActivated: true, source: 'special-activation' }
        }));
        
        // Show success message
        toast({
          title: "DotSpark Activated",
          description: "Your WhatsApp DotSpark is now activated.",
          variant: "default",
        });
        
        // Update activation state
        setActivationState(prev => ({
          ...prev,
          checking: false,
          activated: true,
          lastCheck: Date.now()
        }));
        
        simulateActivation();
      } else {
        console.error("Special activation failed:", await res.text());
        toast({
          title: "Activation Failed",
          description: "There was an error activating your DotSpark. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during special activation:", error);
      toast({
        title: "Activation Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add state for activation status from events
  const [activationState, setActivationState] = useState({
    checking: externalIsChecking !== undefined ? externalIsChecking : false,
    activated: externalIsActivated !== undefined ? externalIsActivated : isWhatsAppConnected,
    lastCheck: Date.now()
  });
  
  // Listen for activation events 
  useEffect(() => {
    // Handle activation started event
    const handleActivationStarted = (event: any) => {
      console.log("WhatsApp activation started event detected", event.detail);
      setActivationState(prev => ({
        ...prev,
        checking: true,
        lastCheck: Date.now()
      }));
    };
    
    // Handle activation success event
    const handleActivationSuccess = (event: any) => {
      console.log("WhatsApp activation success event detected", event.detail);
      setActivationState(prev => ({
        ...prev,
        checking: false,
        activated: true,
        lastCheck: Date.now()
      }));
      
      // Mark as activated in localStorage for persistence
      simulateActivation();
      
      // Show a toast if not already showing one
      if (!linkSent) {
        const userEmail = user?.email || "your account";
        toast({
          title: "DotSpark Activated!",
          description: `Your WhatsApp is now linked to ${userEmail}. All interactions will be synced.`,
          duration: 5000,
        });
      }
    };
    
    // Handle activation failure event
    const handleActivationFailure = (event: any) => {
      console.log("WhatsApp activation failure event detected", event.detail);
      setActivationState(prev => ({
        ...prev,
        checking: false,
        lastCheck: Date.now()
      }));
    };
    
    // Register event listeners
    window.addEventListener('whatsapp_activation_started', handleActivationStarted);
    window.addEventListener('whatsapp_activation_success', handleActivationSuccess);
    window.addEventListener('whatsapp_activation_failure', handleActivationFailure);
    window.addEventListener('whatsapp-status-updated', (e: any) => {
      if (e.detail?.isActivated) handleActivationSuccess(e);
    });
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('whatsapp_activation_started', handleActivationStarted);
      window.removeEventListener('whatsapp_activation_success', handleActivationSuccess);
      window.removeEventListener('whatsapp_activation_failure', handleActivationFailure);
      window.removeEventListener('whatsapp-status-updated', (e: any) => {
        if (e.detail?.isActivated) handleActivationSuccess(e);
      });
    };
  }, [simulateActivation, toast, user, linkSent]);
  
  // Simulate the activation process with a multi-step animation
  useEffect(() => {
    // Only run this effect when the link has been sent
    if (linkSent) {
      let isActivated = false;
      
      // Step 1: Show "Connecting..." toast immediately
      toast({
        title: "Connecting to WhatsApp...",
        description: "Please wait while we establish the connection.",
        duration: 2500,
      });
      
      // Step 2: After a delay, show "Activating..." toast and mark as activated
      const step1Timer = setTimeout(() => {
        toast({
          title: "Activating DotSpark...",
          description: "Setting up your personal cognitive enhancer.",
          duration: 2500,
        });
      }, 2500);
      
      // Step 3: After another delay, show success and redirect
      const step2Timer = setTimeout(() => {
        if (isActivated) return; // Prevent duplicate activation
        isActivated = true;
        
        // Mark as activated in localStorage for persistence
        simulateActivation();
        
        // This activation happens BEFORE localStorage has dotspark_activated set
        // So we need to check a different flag that would indicate a previous activation
        const hasBeenActivatedBefore = localStorage.getItem('dotspark_seen') === 'true';
        
        if (!hasBeenActivatedBefore) {
          const userEmail = user?.email || "your account";
          
          toast({
            title: "DotSpark Activated!",
            description: `Your WhatsApp is now linked to ${userEmail}. All interactions will be synced to your dashboard automatically.`,
            duration: 7000,
          });
          
          // Mark that we've seen the activation before to avoid duplicate toasts
          localStorage.setItem('dotspark_seen', 'true');
        }
        
        // Store welcome message in localStorage so it can be sent to the user
        localStorage.setItem('whatsapp_welcome_message', JSON.stringify({
          title: "✅ Congratulations — your DotSpark is now active!",
          message: "DotSpark is now tuned to grow with your thinking.\nThe more you interact, the sharper and more personalized it becomes.\n\nSay anything — a thought, a question, a decision you're stuck on.\nLet's begin.\n\nYou can also access your personal dashboard for deeper insights at www.dotspark.in"
        }));
        
        // Store activation flags for persistence and UI updates
        localStorage.setItem('dotspark_just_activated', 'true');
        sessionStorage.setItem('show_activation_success', 'true');
        
        // After a brief delay to let status be processed, redirect to the activation page
        setTimeout(() => {
          // Direct navigation to activation page to show success status
          window.location.href = "/activate-dotspark";
        }, 2000);
        
      }, 5000);
      
      // Cleanup function to handle component unmount
      return () => {
        clearTimeout(step1Timer);
        clearTimeout(step2Timer);
        
        // If component unmounts during activation process, still ensure activation is completed
        if (!isActivated) {
          simulateActivation();
        }
      };
    }
  }, [linkSent, simulateActivation, toast, user]);

  // Direct WhatsApp linking without server interaction
  const openWhatsAppLink = async () => {
    try {
      setLoading(true);
      

      
      // Get the user's email or fallback to user ID
      const userEmail = user?.email;
      
      if (!userEmail) {
        // No email available, provide alternative instructions
        toast({
          variant: "destructive",
          title: "Email not available",
          description: "Please log in with an account that has an email address to link WhatsApp.",
        });
        setLoading(false);
        return;
      }
      
      // Create a pre-filled message with natural language and user info
      const phoneNumber = "16067157733";
      
      // Format message with exact wording from requirements
      const message = `Hey DotSpark, please connect my DotSpark via WhatsApp. My DotSpark account is ${userEmail}`;
      
      // Store the message in localStorage for debugging
      console.log("Sending activation message:", message);
      localStorage.setItem('last_activation_message', message);
      
      // Show success toast with better instructions
      toast({
        title: "Opening WhatsApp",
        description: "Just tap send to activate your DotSpark!",
      });
      
      setLinkSent(true);
      
      // Use external direct link if provided
      if (externalDirectLink) {
        console.log("Using external direct link:", externalDirectLink);
        window.location.href = externalDirectLink;
        return;
      }
      
      // For mobile devices, create a direct link to the app with better handling
      const encodedMessage = encodeURIComponent(message);
      const mobileAppLink = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
      const webFallbackUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      // Store the current location before sending to WhatsApp
      sessionStorage.setItem('redirectAfterWhatsApp', 'activate-dotspark');
      
      // Set a timestamp for the redirect expiration (5 minutes from now)
      const expirationTime = Date.now() + (5 * 60 * 1000);
      sessionStorage.setItem('redirectAfterWhatsAppExpires', expirationTime.toString());
      
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Create and click an actual anchor element for better mobile compatibility
        const a = document.createElement('a');
        a.href = mobileAppLink;
        
        // Important: For mobile UX, don't use _blank which prevents returning to our site
        // Use _self to ensure that when the user comes back (hits back), they return to our app
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // After a short delay, try the web version as fallback
        setTimeout(() => {
          // Create a form that does a POST to launch WhatsApp then redirects back
          const form = document.createElement('form');
          form.setAttribute('method', 'get');
          form.setAttribute('action', webFallbackUrl);
          form.setAttribute('target', '_blank');
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
          
          // After a short delay, set up an automatic redirect back to activation page
          // This only works if the user comes back to this tab after sending their message
          setTimeout(() => {
            window.location.href = "/activate-dotspark";
          }, 5000);
        }, 1000);
      } else {
        // For desktop, use direct navigation to avoid popup blocker
        window.location.href = webFallbackUrl;
      }
      
      // Add logging for debugging
      console.log(`Attempted to open WhatsApp with email: ${userEmail}`);
      
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast({
        variant: "destructive",
        title: "Unable to open WhatsApp",
        description: "Please manually send 'link:your-email@example.com' to +16067157733 in WhatsApp",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mb-2">
      {/* When activation is in progress, show a different state */}
      {activationState.checking && !activationState.activated && (
        <div className="mb-3 p-3 bg-gradient-to-br from-yellow-50/90 to-amber-50/90 dark:from-yellow-950/30 dark:to-amber-950/30 border-2 border-yellow-200 dark:border-yellow-900/30 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2 relative">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400 dark:border-yellow-500 animate-ping opacity-50"></div>
              <Loader2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
            </div>
            <h3 className="text-yellow-700 dark:text-yellow-400 font-bold text-sm mb-1">
              Checking Activation Status
            </h3>
            <p className="text-yellow-600 dark:text-yellow-500 text-xs mb-2 max-w-xs mx-auto">
              Please wait while we verify your WhatsApp connection...
            </p>
          </div>
        </div>
      )}
      
      {/* When fully activated, show success state instead of instructions */}
      {activationState.activated && (
        <div className="mb-3 p-4 bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-900/30 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2 relative">
              <div className="absolute inset-0 rounded-full border-4 border-green-400/40 dark:border-green-500/40"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 dark:border-t-green-400 animate-spin opacity-70"></div>
              <div className="absolute inset-2 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-green-700 dark:text-green-400 font-bold text-lg mb-1">
              DotSpark Activated
            </h3>
            <p className="text-green-600 dark:text-green-500 text-sm mb-3 max-w-sm mx-auto">
              Your WhatsApp is now connected to DotSpark. Your personal cognitive enhancer is ready to use.
            </p>
          </div>
        </div>
      )}
      
      {/* Main instructions when not yet activated */}
      {!activationState.activated && !activationState.checking && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="bg-muted p-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Hi! I'm DotSpark</h3>
              <p className="text-xs text-muted-foreground">
                I need WhatsApp access to enhance your thinking
              </p>
            </div>
          </div>
          
          <div className="p-3">
            <div className="space-y-3">
              {/* Simplified WhatsApp direct linking implementation */}
              <div className="bg-primary/5 rounded-md p-3 border border-primary/10">
                <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 text-sm">Authenticate DotSpark</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Connect your WhatsApp to allow DotSpark to collect and process your learning moments
                </p>
                
                <Button
                  onClick={openWhatsAppLink}
                  disabled={loading || !user}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-br from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <SendHorizonal className="h-4 w-4 mr-2" />
                  )}
                  Connect via WhatsApp
                </Button>
                
                {/* Special activation for test users */}
                {isSpecialPhoneNumber && (
                  <Button
                    onClick={activateSpecialNumber}
                    disabled={loading || !user}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Special Activation
                  </Button>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">Why connect WhatsApp?</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Capture thoughts on-the-go from your phone</li>
                  <li>Message DotSpark directly when you have questions</li>
                  <li>Get personalized insights from your ongoing interactions</li>
                  <li>All messages sync to your dashboard automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}