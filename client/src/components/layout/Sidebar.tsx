import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  Brain,
  Sparkles,
  Shield
} from "lucide-react";
import { neuraStorage } from "@/lib/neuraStorage";



interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  onNewEntry: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile, onNewEntry }) => {
  const [location] = useLocation();
  
  // Check activation status from neuraStorage
  const isActivated = neuraStorage.isActivated();

  if (!isOpen) return null;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: "dotspark-logo", label: "My DotSpark", path: "/sectioned-dotspark-tuning", isSpecial: true, showActivationSpark: true },
    { icon: Brain, label: "My Neura", path: "/my-neura", showActivationDot: true },
    { icon: Brain, label: "Social Neura", path: "/social", showAnimatedBrain: true },
  ];

  const sidebarClasses = isMobile
    ? "fixed inset-y-0 left-0 z-40 w-64 bg-card shadow-xl transform transition-transform duration-200 ease-in-out border-r"
    : "w-64 flex-shrink-0 border-r h-full overflow-y-auto bg-card/50";

  return (
    <div className={sidebarClasses}>
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <img src="/dotspark-logo-icon.jpeg" alt="DotSpark" className="mr-2 h-6 w-6 object-contain rounded" />
          <span className="text-amber-700 dark:text-amber-400 font-bold">
            DotSpark
          </span>
        </h1>
      </div>



      <ScrollArea className="flex-1 h-[calc(100vh-9rem)]">
        <nav className="mt-2 px-4">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 ml-2">Navigation</h2>
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                    location === item.path
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                  onClick={isMobile ? onClose : undefined}
                >
                  <div className="relative mr-2">
                    {item.icon === "dotspark-logo" ? (
                      <img 
                        src="/dotspark-logo-icon.jpeg" 
                        alt="DotSpark" 
                        className={`h-5 w-5 object-contain rounded ${
                          isActivated ? "animate-pulse" : ""
                        }`}
                      />
                    ) : (
                      React.createElement(item.icon, { 
                        className: `${
                          item.label === "Home" 
                            ? "text-amber-600 dark:text-amber-400"
                            : item.label === "My Neura"
                              ? "text-amber-600 dark:text-amber-400"
                              : item.label === "Social Neura"
                                ? "text-purple-600 dark:text-purple-400 animate-pulse"
                                : "text-gray-500 dark:text-gray-400"
                        }`, 
                        size: 20
                      })
                    )}
                    {item.showActivationDot && isActivated && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  {item.isSpecial ? (
                    <span className="font-medium text-amber-700 dark:text-amber-400">{item.label}</span>
                  ) : (
                    <span className={`${location === item.path ? "text-amber-800 dark:text-amber-200" : "text-muted-foreground"}`}>{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>


        </nav>
        <Separator className="my-6 opacity-50" />
        <div className="px-4 pb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">DotSpark v1.0</p>
          <div className="flex items-center text-muted-foreground/70">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
            <span className="text-xs">Connected</span>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
