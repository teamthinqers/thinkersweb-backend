import { Button } from "@/components/ui/button";
import { Smartphone, MessageCircle } from "lucide-react";

// Function to open WhatsApp chat directly in the app
function openWhatsAppChat() {
  // Replace with your actual Twilio WhatsApp number
  const whatsappNumber = "14155238886"; // Example: This is a Twilio demo number
  const message = "Hello! I'd like to learn more about DotSpark.";
  
  // Try to open WhatsApp mobile app first
  const mobileAppLink = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
  
  // Create an invisible anchor element
  const linkElement = document.createElement('a');
  linkElement.href = mobileAppLink;
  linkElement.style.display = 'none';
  document.body.appendChild(linkElement);
  
  // Try to open the mobile app
  linkElement.click();
  
  // Set a fallback timer in case the app doesn't open
  setTimeout(() => {
    // If app didn't open, use the web version
    const webFallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = webFallbackUrl;
  }, 500);
  
  // Clean up the element
  setTimeout(() => {
    document.body.removeChild(linkElement);
  }, 1000);
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
              <div className="h-full w-full bg-gradient-to-b from-indigo-100 to-sky-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden pt-6">
                {/* WhatsApp header */}
                <div className="bg-[#128C7E] h-16 px-4 flex items-center justify-between text-white">
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
                    <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-lg max-w-[75%] text-sm ml-auto">
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
                    <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-lg max-w-[75%] text-sm ml-auto">
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
          <div className="space-y-8 md:space-y-10 order-1 md:order-2">
            <div>
              <div className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 text-sm text-indigo-700 dark:text-indigo-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Neural Extension Technology
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your Brain's <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">Digital Extension</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Tune your neural extension instantly through WhatsApp. Connect directly to your cognitive ecosystem and extend your brain's capabilities.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-center py-12 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-purple-950/40 rounded-2xl opacity-80"></div>
                <div className="absolute -top-8 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-8 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <Button 
                    onClick={openWhatsAppChat}
                    className="bg-[#128C7E] hover:bg-[#075E54] flex items-center gap-3 py-7 px-10 rounded-xl shadow-lg transform transition-all hover:scale-105 border-2 border-white/20"
                    size="lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-white rounded-full opacity-20 animate-pulse"></div>
                        <svg className="w-8 h-8 relative" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white">
                          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="text-xl font-bold">Connect Neural Extension</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Via WhatsApp</span>
                          <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Button>
                  
                  <div className="flex items-center mt-2 bg-white/90 text-gray-800 px-4 py-2 rounded-full shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><circle cx="12" cy="12" r="4"></circle></svg>
                    <span className="text-sm font-medium">AI-powered neural technology</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Personalized Neural Tuning</h3>
                    <p className="text-muted-foreground">Tune your neural extension to your specific cognitive patterns through natural conversation.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Adaptive Neural Networking</h3>
                    <p className="text-muted-foreground">Your extension continuously adapts and creates neural connections from your thoughts and inputs.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15v-2"></path><path d="M12 15v-4"></path><path d="M15 15v-6"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Cognitive Performance Metrics</h3>
                    <p className="text-muted-foreground">Access the full dashboard to view your neural extension's growth, connections, and cognitive performance.</p>
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