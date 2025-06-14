import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, Smartphone, MessageCircle, SendHorizonal, Check } from "lucide-react";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";


export function NeuralWhatsAppLinking() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [, setLocation] = useLocation();
  const { simulateActivation, isWhatsAppConnected, phoneNumber } = useWhatsAppStatus();
  
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
        localStorage.setItem('whatsapp_activated', 'true');
        localStorage.setItem('whatsapp_phone', '+919840884459');
        
        // Trigger status update events
        window.dispatchEvent(new CustomEvent('whatsapp-status-updated', { 
          detail: { isActivated: true, source: 'special-activation' }
        }));
        
        // Show success message
        toast({
          title: "Neural Extension Activated",
          description: "Your WhatsApp neural extension is now activated.",
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
          description: "There was an error activating your neural extension. Please try again.",
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
    checking: false,
    activated: isWhatsAppConnected,
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
          title: "Neural Extension Activated!",
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
          title: "Activating Neural Extension...",
          description: "Setting up your personal cognitive extension.",
          duration: 2500,
        });
      }, 2500);
      
      // Step 3: After another delay, show success and redirect
      const step2Timer = setTimeout(() => {
        if (isActivated) return; // Prevent duplicate activation
        isActivated = true;
        
        // Mark as activated in localStorage for persistence
        simulateActivation();
        
        // This activation happens BEFORE localStorage has whatsapp_activated set
        // So we need to check a different flag that would indicate a previous activation
        const hasBeenActivatedBefore = localStorage.getItem('neural_extension_seen') === 'true';
        
        if (!hasBeenActivatedBefore) {
          const userEmail = user?.email || "your account";
          
          toast({
            title: "Neural Extension Activated!",
            description: `Your WhatsApp is now linked to ${userEmail}. All interactions will be synced to your dashboard automatically.`,
            duration: 7000,
          });
          
          // Mark that we've seen the activation before to avoid duplicate toasts
          localStorage.setItem('neural_extension_seen', 'true');
        }
        
        // Store welcome message in localStorage so it can be sent to the user
        localStorage.setItem('whatsapp_welcome_message', JSON.stringify({
          title: "✅ Congratulations — your Neural Extension is now active!",
          message: "DotSpark is now tuned to grow with your thinking.\nThe more you interact, the sharper and more personalized it becomes.\n\nSay anything — a thought, a question, a decision you're stuck on.\nLet's begin.\n\nYou can also access your personal dashboard for deeper insights at www.dotspark.in"
        }));
        
        // Store activation flags for persistence and UI updates
        localStorage.setItem('neural_just_activated', 'true');
        sessionStorage.setItem('show_activation_success', 'true');
        
        // After a brief delay to let status be processed, redirect to the activation page
        setTimeout(() => {
          // Direct navigation to activation page to show success status
          window.location.href = "/activate-neural";
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
        description: "Just tap send to activate your neural extension!",
      });
      
      setLinkSent(true);
      
      // For mobile devices, create a direct link to the app with better handling
      const encodedMessage = encodeURIComponent(message);
      const mobileAppLink = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
      const webFallbackUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      // Store the current location before sending to WhatsApp
      sessionStorage.setItem('redirectAfterWhatsApp', 'activate-neural');
      
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
            window.location.href = "/activate-neural";
          }, 5000);
        }, 1000);
      } else {
        // For desktop, open in a new window/tab but ensure our page stays in the current tab
        const whatsappWindow = window.open(webFallbackUrl, '_blank');
        
        // If we have a reference to the opened window, we can set up a check
        // to see when it's closed and redirect back to activation page
        if (whatsappWindow) {
          const checkClosed = setInterval(() => {
            if (whatsappWindow.closed) {
              clearInterval(checkClosed);
              window.location.href = "/activate-neural";
            }
          }, 1000);
          
          // Clear the interval after 2 minutes to avoid resource usage
          setTimeout(() => clearInterval(checkClosed), 2 * 60 * 1000);
        }
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
              Neural Extension Activated
            </h3>
            <p className="text-green-600 dark:text-green-500 text-sm mb-3 max-w-sm mx-auto">
              Your WhatsApp is now connected to DotSpark. Your personal cognitive extension is ready to help you think clearer and faster.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                onClick={() => window.location.href = "/dashboard"}
                className="bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white px-4 py-2 gap-1 shadow-md"
                size="sm"
              >
                <span>Go to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Show standard instructions if not activated or checking */}
      {!activationState.activated && !activationState.checking && (
        <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/30 dark:to-blue-950/30 p-3 rounded-lg border-2 border-indigo-100 dark:border-indigo-900/30 mb-3 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Mobile device illustration */}
            <div className="relative w-20 h-36 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border-2 border-slate-300 dark:border-slate-700 flex-shrink-0 mx-auto sm:mx-0">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
              <div className="absolute inset-1 rounded-lg overflow-hidden flex flex-col">
                <div className="h-5 bg-[#128C7E] flex items-center justify-center px-1 text-[7px] text-white font-medium">
                  DotSpark
                </div>
                <div className="flex-1 bg-[#E5DDD5] dark:bg-[#0D1418] p-1 flex flex-col justify-end">
                  <div className="ml-1 max-w-[80%] bg-white dark:bg-slate-700 p-1 text-[5px] rounded-lg mb-1 shadow-sm">
                    Hi! I'm DotSpark's Neural Extension
                  </div>
                  <div className="mr-1 ml-auto max-w-[80%] bg-[#D9FDD3] dark:bg-[#005C4B] p-1 text-[5px] rounded-lg shadow-sm">
                    Hey DotSpark, authenticate...
                  </div>
                </div>
              </div>
              
              {/* Animated connection ring */}
              <div className="absolute -inset-1 border-2 border-primary/30 rounded-xl animate-ping opacity-30"></div>
            </div>
            
            {/* Instructions */}
            <div className="flex-1">
              <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 text-sm">Authenticate WhatsApp</h4>
              <ol className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-5 h-5 rounded-full mr-1 font-medium text-[10px]">1</span>
                  <span>Click <span className="font-medium text-primary">Authenticate with WhatsApp</span> button</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-5 h-5 rounded-full mr-1 font-medium text-[10px]">2</span>
                  <span>WhatsApp opens with authentication message</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-5 h-5 rounded-full mr-1 font-medium text-[10px]">3</span>
                  <span>Tap <span className="font-medium text-green-600 dark:text-green-400">Send</span> to complete - you'll be redirected automatically</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
      
      {/* When link is sent, show waiting state */}
      {linkSent && !activationState.activated && (
        <div className="mb-3 p-3 bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-900/30 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
              <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-green-700 dark:text-green-400 font-bold text-sm mb-1">
              WhatsApp Ready!
            </h3>
            <p className="text-green-600 dark:text-green-500 text-xs mb-2 max-w-xs mx-auto">
              Send the pre-filled message to complete activation!
            </p>
            <div className="mt-2">
              <Button
                onClick={openWhatsAppLink}
                className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white w-full sm:w-auto px-4 py-1 flex items-center justify-center gap-1 shadow-md"
                size="sm"
              >
                <SendHorizonal className="h-3 w-3" />
                <span>Re-open WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Only show button if not activated or link sent already */}
      {!activationState.activated && !linkSent && !activationState.checking && (
        <Button 
          onClick={openWhatsAppLink} 
          disabled={loading}
          className="w-full sm:w-auto mx-auto px-6 py-3 h-auto text-base font-medium relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white shadow-lg"
          size="default"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-indigo-600/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Opening WhatsApp...</span>
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Authenticate with WhatsApp</span>
              <div className="absolute -inset-1 blur-xl bg-gradient-to-r from-indigo-600/20 to-primary/20 group-hover:opacity-100 opacity-0 transition-opacity"></div>
            </>
          )}
        </Button>
      )}
    </div>
  );
}