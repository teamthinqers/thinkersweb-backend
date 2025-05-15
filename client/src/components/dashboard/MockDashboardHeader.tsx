import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Menu, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobile } from "@/hooks/use-mobile";

const MockDashboardHeader: React.FC = () => {
  const isMobile = useMobile();

  return (
    <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left section: Logo or home icon */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size={isMobile ? "icon" : "sm"}
            className="text-gray-600 hover:text-primary"
            asChild
          >
            <Link href="/">
              {isMobile ? (
                <Home className="h-5 w-5" />
              ) : (
                <>
                  <Home className="h-5 w-5 mr-2" />
                  <span>Back to Home</span>
                </>
              )}
            </Link>
          </Button>
        </div>

        {/* Center section: Title */}
        {!isMobile && (
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-primary">DotSpark Dashboard</h1>
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              Preview Mode
            </span>
          </div>
        )}

        {/* Right section: User menu */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white shadow">
                  <AvatarFallback className="bg-primary text-white">
                    D
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <>
                    <span className="ml-2 text-sm">Demo User</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 text-sm">
                <p className="font-medium">Demo User</p>
                <p className="text-xs text-muted-foreground">demo@example.com</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/auth" className="cursor-pointer w-full">
                  Sign In
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer w-full">
                  Back to Home
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default MockDashboardHeader;