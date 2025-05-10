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
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column with mockup */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/10 rounded-full blur-3xl opacity-70"></div>
            
            {/* Phone mockup */}
            <div className="relative mx-auto w-[280px] h-[580px] bg-black rounded-[3rem] border-[14px] border-black overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-6 bg-black z-10"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-xl z-20"></div>
              <div className="h-full w-full bg-gradient-to-b from-indigo-100 to-sky-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden pt-6">
                {/* WhatsApp header */}
                <div className="bg-primary h-16 px-4 flex items-center text-white">
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-3" />
                    <span className="font-semibold">DotSpark Chat</span>
                  </div>
                </div>
                
                {/* Chat bubbles */}
                <div className="p-3 space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg max-w-[75%] text-sm ml-auto">
                      Just learned about the importance of active recall in studying.
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg max-w-[75%] text-sm shadow-sm">
                      <div className="font-medium text-primary">DotSpark</div>
                      ✅ New learning dot created!
                      <br /><br />
                      Title: Active Recall Study Technique
                      <br /><br />
                      Category: Learning Methods
                      <br />
                      Tags: study-techniques, memory
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg max-w-[75%] text-sm ml-auto">
                      Q: How does this connect to my note about spaced repetition?
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg max-w-[75%] text-sm shadow-sm">
                      <div className="font-medium text-primary">DotSpark</div>
                      Both active recall and spaced repetition enhance long-term memory. Combining them creates a powerful learning system where you actively retrieve information at optimal intervals.
                      <br /><br />
                      Your note on spaced repetition from last week emphasizes the timing aspect, while active recall focuses on the retrieval method.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column with text and form */}
          <div className="space-y-6">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-0">
              Neural Extension
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Brain's <span className="gradient-heading">Digital Extension</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Tune your neural extension instantly through WhatsApp. Connect directly to your cognitive ecosystem and extend your brain's capabilities.
            </p>
            
            <div className="space-y-6 mt-8">
              <div className="flex justify-center py-12 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-purple-950/40 rounded-2xl opacity-80"></div>
                <div className="absolute -top-8 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-8 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <Button 
                    onClick={openWhatsAppChat}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-blue-600 hover:to-indigo-600 flex items-center gap-4 py-7 px-10 rounded-xl shadow-lg transform transition-transform hover:scale-105"
                    size="lg"
                  >
                    <div className="flex items-center gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><circle cx="12" cy="12" r="4"></circle></svg>
                      <span className="text-xl font-medium">Connect Neural Extension</span>
                    </div>
                  </Button>
                  
                  <div className="flex items-center mt-2 bg-green-700 text-white px-4 py-2 rounded-full shadow-md">
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.241-.579-.486-.5-.668-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"></path></svg>
                    <span className="text-sm font-medium">Connects via WhatsApp</span>
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