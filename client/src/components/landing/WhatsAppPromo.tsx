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
              Seamless Integration
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Chat with DotSpark AI <span className="gradient-heading">through WhatsApp</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Start using DotSpark AI instantly through WhatsApp - no account needed! Chat directly with our AI to capture learning moments as they happen and organize your knowledge effortlessly.
            </p>
            
            <div className="space-y-6 mt-8">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-lg mb-4 text-center">
                  Start using DotSpark AI right now
                </h3>
                
                <div className="flex justify-center mb-6">
                  <Button 
                    onClick={openWhatsAppChat}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2 py-6 px-8"
                    size="lg"
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-lg font-medium">Chat on WhatsApp</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                      <span className="font-semibold">1</span>
                    </div>
                    <p className="text-xs mt-2">Send any text to create a learning entry</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                      <span className="font-semibold">2</span>
                    </div>
                    <p className="text-xs mt-2">Start with "Q:" to ask questions</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                      <span className="font-semibold">3</span>
                    </div>
                    <p className="text-xs mt-2">Type "help" for all commands</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Chat-Based Learning</h3>
                    <p className="text-muted-foreground">Have natural conversations with DotSpark AI through WhatsApp to capture learning moments as they happen.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 16.8a7.14 7.14 0 0 0 2.24-3.22 8.34 8.34 0 0 0 .52-2.91c.04-3.34.84-4.2 1.24-4.83"></path><path d="M18 13.84a3.23 3.23 0 0 0 .52-1.47 3.67 3.67 0 0 0-.28-2.3c-.52-1.3-2-3.06-2-4.6 0-1.48 1.15-2.5 2.24-3.3"></path><path d="M11.66 6.5a4 4 0 0 0-1.35 1.14"></path><path d="M21.92 15.66A13.07 13.07 0 0 0 22 13.5c0-3.5-2-3.5-2-5 0-1.53 1-2.5 2-3.29a1 1 0 0 0 0-1.42A10.66 10.66 0 0 0 20 2.77a10.64 10.64 0 0 0-10 0 10.66 10.66 0 0 0-2 1.02 1 1 0 0 0 0 1.42C9 6 10 6.97 10 8.5c0 .79-.17 1.16-.59 1.63"></path><path d="M8.24 17.67A7.44 7.44 0 0 0 10 14c.5 1.5 2 3 2 5 0 1.16-.45 1.96-1.22 2.68"></path><path d="M13.76 17.67A7.44 7.44 0 0 1 12 14c-.5 1.5-2 3-2 5 0 1.16.45 1.96 1.22 2.68"></path><path d="M10 2l2.5 6.5L14 8l1.5-.5L18 2"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI-Powered Processing</h3>
                    <p className="text-muted-foreground">Our AI automatically organizes your messages into structured learning dots with titles, categories, and tags.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Get more with an account</h3>
                    <p className="text-muted-foreground">Create a free account to access your personal dashboard, analytics, and advanced features.</p>
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