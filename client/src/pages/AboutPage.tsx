import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Brain, BookOpen, Users, Sparkles, BarChart2, 
  MessageCircle, MessageSquare, User, Menu, X, Check, CheckCircle, Download,
  Smartphone, Monitor, Share, Plus, Home as HomeIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Dynamic Word component for cycling through words with animation
const DynamicWord = ({ words, interval = 2000 }: { words: string[], interval?: number }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (!words || words.length <= 1) return;
    
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsAnimating(false);
      }, 500); // Half a second for the fade out/in animation
    }, interval);
    
    return () => clearInterval(timer);
  }, [words, interval]);
  
  // Calculate the max width based on the longest word plus period
  const maxWordLength = words?.reduce((max, word) => 
    (word.length + 1) > max ? (word.length + 1) : max, 0) || 11; // +1 for period
  
  // Get width in pixels (approximately)
  const width = `${maxWordLength * 0.7}em`;
  
  return (
    <div 
      className={`relative inline-block text-center transition-opacity duration-500 ${
        isAnimating 
          ? 'opacity-0 blur-sm' 
          : 'opacity-100 blur-0'
      }`}
      style={{
        textShadow: isAnimating ? 'none' : '0 0 12px rgba(178, 120, 255, 0.5)',
        width: width,
        display: 'inline-block',
        textAlign: 'left',
        minWidth: '120px'
      }}
    >
      <span
        style={{
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundImage: 'linear-gradient(135deg, #b278ff, #ff6ad5)',
        }}
      >
        {(words?.[currentIndex] || 'Preserved') + '.'}
      </span>
    </div>
  );
};

// Import all the same components from the original LandingPage
import { WhatsAppContactButton } from "@/components/landing/WhatsAppContactButton";
import { CompactWhatsAppButton } from "@/components/landing/CompactWhatsAppButton";
import { ContactOptionsDialog } from "@/components/landing/ContactOptionsDialog";
import DashboardPreview from "@/components/landing/DashboardPreview";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";

// This will contain the same content as the original LandingPage
// I'll implement the full content in the next step
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About DotSpark</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your intelligent cognitive enhancement platform
          </p>
          <Link href="/">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}