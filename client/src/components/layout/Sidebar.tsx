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
    { icon: Sparkles, label: "My DotSpark", path: "/sectioned-dotspark-tuning", isSpecial: true, showActivationSpark: true },
    { icon: Brain, label: "My Neura", path: "/dashboard", showActivationDot: true },
  ];

  const sidebarClasses = isMobile
    ? "fixed inset-y-0 left-0 z-40 w-64 bg-card shadow-xl transform transition-transform duration-200 ease-in-out border-r"
    : "w-64 flex-shrink-0 border-r h-full overflow-y-auto bg-card/50";

  return (
    <div className={sidebarClasses}>
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <Sparkles className="mr-2 h-6 w-6 text-amber-600" />
          <span className="bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent">
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
                  className={`flex items-center px-3 py-2.5 rounded-md ${
                    location === item.path
                      ? "bg-primary/10 text-primary font-medium"
                      : item.isSpecial
                        ? "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-800 dark:hover:text-amber-300 font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={isMobile ? onClose : undefined}
                >
                  <div className="relative mr-2">
                    {React.createElement(item.icon, { 
                      className: `${
                        item.label === "Home" 
                          ? "text-foreground" 
                          : item.isSpecial 
                            ? isActivated ? "text-amber-600 animate-pulse" : "text-amber-600"
                            : ""
                      }`, 
                      size: item.label === "Home" || item.isSpecial ? 20 : 18 
                    })}
                    {item.showActivationDot && isActivated && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  {item.isSpecial ? (
                    <span className="font-medium bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent">{item.label}</span>
                  ) : (
                    item.label
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
