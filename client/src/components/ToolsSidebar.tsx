import { useState } from "react";
import { Settings, Circle, Hand, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ToolMode = 'select' | 'create-dot' | 'create-wheel';

interface ToolsSidebarProps {
  selectedTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
}

export function ToolsSidebar({ selectedTool, onToolChange }: ToolsSidebarProps) {
  const tools = [
    {
      id: 'select' as ToolMode,
      icon: Hand,
      label: 'Select',
      description: 'Navigate and interact with existing dots and wheels',
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    },
    {
      id: 'create-dot' as ToolMode,
      icon: Circle,
      label: 'Create Dot',
      description: 'Click anywhere on the grid to create a new dot',
      color: 'bg-amber-100 hover:bg-amber-200 text-amber-700'
    },
    {
      id: 'create-wheel' as ToolMode,
      icon: Settings,
      label: 'Create Wheel',
      description: 'Click anywhere on the grid to create a new wheel',
      color: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
    }
  ];

  return (
    <div className="w-20 bg-gradient-to-b from-gray-50 to-gray-100 border-r-2 border-amber-200 shadow-lg flex flex-col min-h-screen">
      {/* Sidebar Header */}
      <div className="flex flex-col items-center py-4 border-b border-amber-200">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-2 shadow-md">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div className="text-xs font-bold text-gray-700">Tools</div>
      </div>
      
      {/* Tools Section - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-8">
        <TooltipProvider>
          {tools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToolChange(tool.id)}
                  className={cn(
                    "w-14 h-14 p-0 rounded-xl border-2 transition-all duration-300 shadow-sm",
                    isSelected 
                      ? `${tool.color} border-current shadow-lg scale-110 ring-2 ring-amber-300` 
                      : "border-gray-300 hover:border-amber-400 hover:shadow-md hover:scale-105"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-7 h-7",
                      tool.id === 'create-wheel' && isSelected && "animate-spin",
                      tool.id === 'create-wheel' && "transition-transform duration-300",
                      isSelected && "drop-shadow-sm"
                    )}
                    style={tool.id === 'create-wheel' && isSelected ? { animationDuration: '3s' } : undefined}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="text-center">
                  <p className="font-semibold">{tool.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
      
      {/* Tool Status Indicator */}
      <div className="border-t-2 border-amber-200 py-4 flex flex-col items-center space-y-3">
        <div className="text-center px-2">
          <div className="text-xs font-semibold text-gray-600 mb-1">Active Tool</div>
          <div className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
            {tools.find(t => t.id === selectedTool)?.label}
          </div>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="w-12 h-12 p-0 rounded-lg border border-gray-300 hover:border-amber-400">
              <Info className="w-5 h-5 text-gray-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="text-center">
              <p className="font-semibold">Usage Guide</p>
              <p className="text-xs text-gray-600 mt-1">
                1. Select a tool from the sidebar<br/>
                2. Click anywhere on the grid<br/>
                3. Fill in the creation form
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}