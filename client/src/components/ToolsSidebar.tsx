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
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-3">
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
                    "w-12 h-12 p-0 rounded-lg border-2 transition-all duration-200",
                    isSelected 
                      ? `${tool.color} border-current shadow-md scale-105` 
                      : "border-transparent hover:border-gray-300"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6",
                      tool.id === 'create-wheel' && isSelected && "animate-spin",
                      tool.id === 'create-wheel' && "transition-transform duration-300"
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
      
      {/* Info section */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="w-12 h-12 p-0 rounded-lg">
              <Info className="w-5 h-5 text-gray-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="text-center">
              <p className="font-semibold">Tool Help</p>
              <p className="text-xs text-gray-600 mt-1">
                Select a tool, then click on the grid to create dots or wheels
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}