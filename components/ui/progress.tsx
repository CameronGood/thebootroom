import * as React from "react";

import { cn } from "@/lib/utils";

interface ChairliftProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  currentStep?: number;
  totalSteps?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ChairliftProgressProps>(
  ({ className, value = 0, max = 100, currentStep, totalSteps, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    // If we have step info, use chairlift design
    if (currentStep !== undefined && totalSteps !== undefined) {
      // Calculate 4 evenly spaced pylon positions from 0% to 100%
      const pylonPositions: number[] = [];
      for (let i = 0; i < 4; i++) {
        pylonPositions.push((i / 3) * 100); // 0%, 33.33%, 66.67%, 100%
      }

      return (
        <div
          ref={ref}
          className={cn(
            "relative w-full h-12 overflow-visible",
            className
          )}
          {...props}
        >
          {/* SVG container for curved cable lines */}
          <svg
            className="absolute top-0 left-0 w-full h-12 pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 2"
          >
            {/* Background cable line with curves between pylons */}
            <path
              d={(() => {
                // Start at first pylon (0%)
                let path = `M 0 0`;
                for (let i = 1; i < pylonPositions.length; i++) {
                  const startX = pylonPositions[i - 1];
                  const endX = pylonPositions[i];
                  const midX = (startX + endX) / 2;
                  const sag = 0.3; // Small sag amount (in viewBox units)
                  // Quadratic curve: control point at midX with sag, end at pylon position (y=0)
                  path += ` Q ${midX} ${sag} ${endX} 0`;
                }
                // Ensure path ends at the last pylon (100%)
                const lastPylon = pylonPositions[pylonPositions.length - 1];
                if (lastPylon === 100) {
                  path += ` L 100 0`;
                }
                return path;
              })()}
              fill="none"
              stroke="rgb(156 163 175 / 0.6)"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Progress cable (completed portion) with curves */}
            {percentage > 0 && (
              <path
                d={(() => {
                  // Start at first pylon (0%)
                  let path = `M 0 0`;
                  let hasDrawn = false;
                  
                  for (let i = 1; i < pylonPositions.length; i++) {
                    const startX = pylonPositions[i - 1];
                    const endX = pylonPositions[i];
                    
                    if (percentage >= endX) {
                      // Full segment - draw complete curve to this pylon
                      const midX = (startX + endX) / 2;
                      const sag = 0.3;
                      path += ` Q ${midX} ${sag} ${endX} 0`;
                      hasDrawn = true;
                    } else if (percentage > startX) {
                      // Partial segment - draw curve up to current progress
                      const midX = (startX + endX) / 2;
                      const sag = 0.3;
                      const progressInSegment = (percentage - startX) / (endX - startX);
                      const currentX = startX + (endX - startX) * progressInSegment;
                      const currentMidX = (startX + currentX) / 2;
                      // Calculate sag at current position using quadratic interpolation
                      const t = progressInSegment;
                      const currentSag = 4 * sag * t * (1 - t);
                      path += ` Q ${currentMidX} ${currentSag} ${currentX} 0`;
                      hasDrawn = true;
                      break;
                    } else {
                      // Before this segment, stop
                      break;
                    }
                  }
                  
                  // If no segments drawn but we have progress, draw a small line from start
                  if (!hasDrawn && percentage > 0) {
                    path += ` L ${percentage} 0`;
                  }
                  
                  // If we've reached 100%, ensure we connect to the final pylon
                  if (percentage >= 100) {
                    const lastPylon = pylonPositions[pylonPositions.length - 1];
                    if (lastPylon === 100) {
                      path += ` L 100 0`;
                    }
                  }
                  
                  return path;
                })()}
                fill="none"
                stroke="#F5E4D0"
                strokeWidth="0.4"
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-300 ease-in-out"
              />
            )}
          </svg>
          
          {/* Pylons descending from cable */}
          {pylonPositions.map((position, index) => (
            <div
              key={index}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `calc(${position}% - 2px - 2px)` }}
            >
              {/* Pylon structure descending downward */}
              <div className="w-1 h-8 bg-gray-500/80" />
              {/* Pylon base at bottom */}
              <div className="w-3 h-1 bg-gray-500/80" />
            </div>
          ))}
          
          {/* Moving chair hanging below cable */}
          <div
            className="absolute top-2 transition-all duration-300 ease-in-out"
            style={{ left: `calc(${percentage}% - 16px)` }}
          >
            {/* Gondola icon */}
            <svg
              width="32"
              height="24"
              viewBox="0 0 32 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
            >
              {/* Connection to cable */}
              <line x1="16" y1="0" x2="16" y2="3" stroke="#2B2D30" strokeWidth="2" />
              {/* Gondola cabin - rounded top and bottom */}
              <rect x="6" y="3" width="20" height="16" rx="3" fill="#F5E4D0" stroke="#2B2D30" strokeWidth="1.5" />
              {/* Windows */}
              <rect x="9" y="6" width="5" height="4" rx="0.5" fill="#2B2D30" opacity="0.3" />
              <rect x="18" y="6" width="5" height="4" rx="0.5" fill="#2B2D30" opacity="0.3" />
              {/* Door line */}
              <line x1="16" y1="3" x2="16" y2="19" stroke="#2B2D30" strokeWidth="1" />
              {/* Bottom support/hinge */}
              <line x1="8" y1="19" x2="24" y2="19" stroke="#2B2D30" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      );
    }

    // Default progress bar (fallback)
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200/60",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-[#F5E4D0] transition-all duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
