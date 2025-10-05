// BACKUP: Liked Dot Visual Design (October 5, 2025)
// This file contains the visual effects and styling for dots that the user liked
// Use this as reference if design gets lost

export const LikedDotVisualDesign = () => {
  return (
    <>
      {/* Outer pulsing ring with channel color */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${channelConfig.color} opacity-30 group-hover:opacity-50 transition-opacity animate-pulse`}
           style={{ transform: 'scale(1.2)' }} />
      
      {/* Middle glow layer with channel color */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${channelConfig.color} blur-lg opacity-60 group-hover:opacity-80 transition-opacity`} />
      
      {/* Main circular thought with solid channel styling */}
      <div className={`relative w-full h-full rounded-full bg-white border-4 ${channelConfig.borderColor} group-hover:${channelConfig.hoverBorderColor} shadow-2xl group-hover:shadow-[0_20px_60px_-15px_rgba(251,146,60,0.5)] transition-all flex flex-col items-center justify-center p-4 overflow-hidden`}>
        {/* Solid background layer with channel gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${channelConfig.bgGradient} opacity-95`} />
        
        {/* Content wrapper */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-2">
          
          {/* Heading - prominently displayed in center */}
          <h3 className="text-sm font-bold text-gray-900 text-center line-clamp-4 leading-tight">
            {dot.heading}
          </h3>

        </div>
      </div>

      {/* Channel indicator badge */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className={`h-6 w-6 rounded-full ${channelConfig.badgeBg} flex items-center justify-center shadow-md ring-2 ring-white`}>
                <ChannelIcon className="h-3 w-3 text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">From {channelConfig.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

// Key visual features to preserve:
// 1. Triple layer effect: outer pulsing ring (1.2x scale), middle glow (blur-lg), main circle
// 2. Channel-specific color gradients throughout
// 3. Hover states: opacity changes and shadow enhancement
// 4. Border styling with channel colors
// 5. Float animation on container: float-${dot.id % 3} with 6+ seconds
// 6. Hover scale-110 on main container
// 7. Channel badge at bottom with ring-2 ring-white
// 8. Group hover interactions

// Identity Card Design:
// - Position: bottom: calc(100% + 20px) from dot
// - Styling: bg-white/95 backdrop-blur-md shadow-lg border-2 border-amber-200
// - Avatar: h-7 w-7 border-2 border-amber-300
// - Text: text-xs font-semibold text-gray-900 whitespace-nowrap
