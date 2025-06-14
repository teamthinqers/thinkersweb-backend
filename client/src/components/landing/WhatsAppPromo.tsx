import { Button } from "@/components/ui/button";
import { Smartphone, MessageCircle } from "lucide-react";
// Function to open WhatsApp chat directly in the app
async function openWhatsAppChat() {

  // Your production Twilio WhatsApp number
  const whatsappNumber = "16067157733";
  const message = "Hey DotSpark, I've got a few things on my mind — need your thoughts";
  
  console.log("Opening WhatsApp chat with:", whatsappNumber);
  
  // Check if this is the first time the user is visiting (using local storage)
  const hasVisited = localStorage.getItem('whatsapp_visited');
  
  // Always include the welcome message for better user experience
  const mobileAppLink = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
  const webFallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  
  // Mark as visited for future tracking
  if (!hasVisited) {
    localStorage.setItem('whatsapp_visited', 'true');
  }
  
  // For mobile devices, create a direct link to the app with better handling
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // Create and click an actual anchor element for better mobile compatibility
    const a = document.createElement('a');
    a.href = mobileAppLink;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // After a short delay, try the web version as fallback
    setTimeout(() => {
      window.open(webFallbackUrl, '_blank');
    }, 1000);
  } else {
    // For desktop, use the web version directly
    window.open(webFallbackUrl, '_blank');
  }
}

export default function WhatsAppPromo() {
  return (
    <div className="bg-gradient-to-b from-indigo-50 via-slate-50 to-white dark:from-indigo-950/30 dark:via-gray-900 dark:to-gray-950 py-24 relative overflow-hidden">
      {/* Neural network visual elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 animate-pulse"></div>
        <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50 animate-pulse"></div>
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50 animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 z-10 relative">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column with mockup */}
          <div className="relative order-2 md:order-1 mt-10 md:mt-0">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl opacity-70"></div>
            
            {/* Phone mockup */}
            <div className="relative mx-auto w-[280px] h-[580px] bg-black rounded-[3rem] border-[14px] border-black overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-6 bg-black z-10"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-xl z-20"></div>
              <div className="h-full w-full bg-[#ECE5DD] dark:bg-[#0D1F2B] overflow-hidden pt-6">
                {/* WhatsApp header */}
                <div className="bg-[#075E54] h-16 px-4 flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z"></path>
                    </svg>
                    <span className="font-semibold">Neural Extension</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><circle cx="12" cy="12" r="4"></circle></svg>
                    <div className="w-2 h-2 bg-blue-400 rounded-full ml-2 animate-ping"></div>
                  </div>
                </div>
                
                {/* Chat bubbles */}
                <div className="p-3 space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] dark:bg-[#1EAA5E]/60 p-2 rounded-lg max-w-[75%] text-sm ml-auto">
                      Just had an insight about neural network training optimization.
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg max-w-[75%] text-sm shadow-sm">
                      <div className="font-medium text-primary">Neural Extension</div>
                      🧠 Neural connection established
                      <br /><br />
                      <span className="text-xs opacity-70">Processing cognitive pattern...</span>
                      <br /><br />
                      <span className="font-medium">Neural Node:</span> Computational Optimization
                      <br />
                      <span className="font-medium">Connections:</span> 7 related neurons
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] dark:bg-[#1EAA5E]/60 p-2 rounded-lg max-w-[75%] text-sm ml-auto">
                      How does this connect to my insight about gradient descent?
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg max-w-[75%] text-sm shadow-sm">
                      <div className="font-medium text-primary">Neural Extension</div>
                      <span className="text-xs opacity-70">Mapping neural pathways...</span>
                      <br /><br />
                      Your neural extension has identified 3 connections between optimization techniques and gradient descent methods. The strongest pathway shows that both concepts share foundational mathematics in your cognitive network.
                      <br /><br />
                      <span className="text-xs opacity-70">Neural mapping complete (97% accuracy)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column with text and form */}
          <div className="space-y-6 md:space-y-8 order-1 md:order-2 max-w-xl mx-auto md:mx-0">
            <div>
              <div className="inline-flex items-center rounded-full bg-[#25D366]/10 dark:bg-[#25D366]/20 px-3 py-1 text-xs text-[#075E54] dark:text-[#25D366] mb-2">
                <svg className="w-3.5 h-3.5 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z"></path>
                </svg>
                Neural Extension via WhatsApp
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Your Brain's <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">Digital Extension</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Tune your neural extension through WhatsApp. Connect to your cognitive ecosystem and extend your brain's capabilities.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-center py-5 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-purple-950/40 rounded-lg opacity-80"></div>
                <div className="absolute -top-4 left-1/4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 right-1/4 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl"></div>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <Button 
                    onClick={openWhatsAppChat}
                    className="bg-[#25D366] hover:bg-[#128C7E] flex items-center gap-2"
                    size="sm"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white">
                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z"></path>
                      </svg>
                      <span className="text-base font-medium">Connect via WhatsApp</span>
                    </div>
                  </Button>
                  
                  <div className="flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-muted-foreground"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><circle cx="12" cy="12" r="4"></circle></svg>
                    <span className="text-sm text-muted-foreground">AI-powered neural technology</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Neural Tuning</h3>
                    <p className="text-muted-foreground text-sm">Tune your neural extension directly through WhatsApp - no signup required.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Adaptive Networking</h3>
                    <p className="text-muted-foreground text-sm">Creates neural connections from your inputs.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15v-2"></path><path d="M12 15v-4"></path><path d="M15 15v-6"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Performance Metrics</h3>
                    <p className="text-muted-foreground text-sm">Create a DotSpark account to access your neural connections via dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}