"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  points: string;
  opacity: number;
  hasCollided?: boolean; // Track if this flake has already collided
  flashStartTime?: number; // When the flash effect started
}

interface ButtonInfo {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pileHeight: number; // Height of snow pile in pixels
  collisionCount: number;
  isFalling?: boolean; // Track if pile is currently falling
  fallStartTime?: number; // When the fall animation started
}

interface FallingChunk {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

interface SnowfallProps {
  startDelay?: number;
  flakeCount?: number;
}

export const Snowfall = React.memo(function Snowfall({ startDelay = 1.4, flakeCount = 200 }: SnowfallProps) {
  // Toggle for advanced collision / snow pile effects
  const COLLISIONS_ENABLED = false;

  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [snowPiles, setSnowPiles] = useState<ButtonInfo[]>([]);
  const [fallingChunks, setFallingChunks] = useState<FallingChunk[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const flakeRefsRef = useRef<Map<number, SVGSVGElement>>(new Map());
  const chunkRefsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const flakesDataRef = useRef<Snowflake[]>([]);
  const fallingChunksRef = useRef<FallingChunk[]>([]);
  const containerDimensionsRef = useRef({ width: 1920, height: 1080 });
  const buttonsRef = useRef<ButtonInfo[]>([]);
  const lastButtonUpdateRef = useRef<number>(0);
  const chunkIdCounterRef = useRef<number>(0);
  const MAX_PILE_HEIGHT = 30;
  const FLASH_DURATION = 150; // milliseconds - how long flake flashes white on collision

  // Simplified polygon generation - memoized
  const generatePolygonPoints = useCallback((sides: number, size: number): string => {
    const points: string[] = [];
    const angleStep = (2 * Math.PI) / sides;
    
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep;
      const radiusVariation = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
      const radius = size * radiusVariation;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    
    return points.join(" ");
  }, []);

  // Start snowfall after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(true);
    }, startDelay * 1000);

    return () => clearTimeout(timer);
  }, [startDelay]);

  // Find and track button positions - memoized
  const updateButtonPositions = useCallback(() => {
    if (!COLLISIONS_ENABLED) return;
    const container = containerRef.current;
    if (!container) return;

    const buttons = container.parentElement?.querySelectorAll('a[href="/results"], a[href="/quiz"]') || [];
    const buttonInfos: ButtonInfo[] = [];

    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const existingButton = buttonsRef.current[index];
      buttonInfos.push({
        id: `button-${index}`,
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
        pileHeight: existingButton?.pileHeight || 0,
        collisionCount: existingButton?.collisionCount || 0,
        isFalling: existingButton?.isFalling || false,
        fallStartTime: existingButton?.fallStartTime || 0,
      });
    });

    buttonsRef.current = buttonInfos;
    setSnowPiles([...buttonInfos]);
  }, []);

  // Initialize all flakes at once (simpler than individual generation)
  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const width = container.offsetWidth || window.innerWidth || 1920;
    const height = container.offsetHeight || window.innerHeight || 1080;
    containerDimensionsRef.current = { width, height };

    // When collisions are enabled, update button positions after a short delay
    if (COLLISIONS_ENABLED) {
      setTimeout(updateButtonPositions, 2000);
    }

    const newFlakes: Snowflake[] = [];
    
    for (let i = 0; i < flakeCount; i++) {
      const sides = Math.floor(Math.random() * 3) + 7; // 7-9 sides
      const size = Math.random() * 14 + 6; // 6-20px
      
      newFlakes.push({
        id: i,
        x: Math.random() * width,
        y: -50 - Math.random() * height * 1.5,
        size: size,
        speed: Math.random() * 1.2 + 0.5, // 0.5-1.7px per frame
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1, // Simplified: -0.5 to 0.5
        points: generatePolygonPoints(sides, size),
        opacity: Math.random() * 0.7 + 0.2, // 0.2 to 0.9
        hasCollided: false,
      });
    }

    setSnowflakes(newFlakes);
    flakesDataRef.current = newFlakes;
  }, [isActive, flakeCount]);

  // Update button positions periodically
  useEffect(() => {
    if (!isActive || !COLLISIONS_ENABLED) return;

    const interval = setInterval(() => {
      updateButtonPositions();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isActive]);

  // Simplified animation loop with collision detection
  useEffect(() => {
    if (!isActive || snowflakes.length === 0) return;

    const animate = () => {
      const flakes = flakesDataRef.current;
      if (flakes.length === 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const { width, height } = containerDimensionsRef.current;
      const currentTime = Date.now();
      const timeOffset = currentTime * 0.0005; // Cache time calculation
      
      // Cache polygon elements to avoid repeated queries
      const polygonCache = new Map<number, SVGPolygonElement>();
      
      flakes.forEach((flake) => {
        const svgElement = flakeRefsRef.current.get(flake.id);
        if (!svgElement) return;

        // Simple falling with minimal horizontal drift
        flake.y += flake.speed;
        flake.x += Math.sin(flake.id * 0.01 + timeOffset) * 0.15; // Use cached time offset
        flake.rotation += flake.rotationSpeed;
        
        // Normalize rotation
        if (flake.rotation > 360) flake.rotation -= 360;
        if (flake.rotation < 0) flake.rotation += 360;

        // Handle flash effect - cache polygon element
        let polygonElement = polygonCache.get(flake.id);
        if (!polygonElement) {
          polygonElement = svgElement.querySelector('polygon') as SVGPolygonElement;
          if (polygonElement) {
            polygonCache.set(flake.id, polygonElement);
          }
        }
        
        if (polygonElement && flake.flashStartTime) {
          const flashElapsed = currentTime - flake.flashStartTime;
          if (flashElapsed < FLASH_DURATION) {
            // Flake is flashing - make it white
            polygonElement.setAttribute('fill', '#FFFFFF');
            polygonElement.setAttribute('stroke', '#FFFFFF');
          } else {
            // Flash complete - reset to dark grey and clear flash
            polygonElement.setAttribute('fill', '#212121');
            polygonElement.setAttribute('stroke', '#212121');
            flake.flashStartTime = undefined;
          }
        }

        // When collisions are disabled, skip collision / pile logic
        if (COLLISIONS_ENABLED) {
          const buttons = buttonsRef.current;

          // Check for collision with button tops
          if (!flake.hasCollided) {
            buttons.forEach((button) => {
              const flakeCenterX = flake.x;
              const flakeCenterY = flake.y;
              const buttonTop = button.y;
              const buttonBottom = button.y + button.height;
              const buttonLeft = button.x;
              const buttonRight = button.x + button.width;

              // Check if flake is within button's X bounds and at/near the top
              // Don't accumulate snow if pile is falling
              if (
                !button.isFalling &&
                flakeCenterX >= buttonLeft &&
                flakeCenterX <= buttonRight &&
                flakeCenterY >= buttonTop - 5 &&
                flakeCenterY <= buttonTop + 10
              ) {
                // Collision detected - increase snow pile and flash flake white
                button.collisionCount += 1;
                const newPileHeight = Math.min(button.collisionCount * 0.5, MAX_PILE_HEIGHT);
                button.pileHeight = newPileHeight;
                flake.hasCollided = true;
                flake.flashStartTime = currentTime; // Start flash effect
                
                // Trigger fall animation when max height is reached
                if (newPileHeight >= MAX_PILE_HEIGHT && !button.isFalling) {
                  button.isFalling = true;
                  button.fallStartTime = currentTime;
                }
                
                // Update state to trigger re-render of snow piles
                setSnowPiles([...buttons]);
              }
            });
          }
        }

        // Reset when off screen (reset collision flag and flash too)
        if (flake.y > height + 50) {
          flake.y = -50 - Math.random() * height * 1.5;
          flake.x = Math.random() * width;
          flake.hasCollided = false;
          flake.flashStartTime = undefined;
          
          // Reset color to dark grey
          if (polygonElement) {
            polygonElement.setAttribute('fill', '#212121');
            polygonElement.setAttribute('stroke', '#212121');
          }
        }

        // Direct DOM update using transform3d for GPU acceleration
        svgElement.style.transform = `translate3d(${flake.x}px, ${flake.y}px, 0) rotate(${flake.rotation}deg)`;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, snowflakes.length]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none"
      style={{ zIndex: 40 }}
    >
      <div className="absolute inset-0 w-full h-full" style={{ contain: 'layout style paint' }}>
        {snowflakes.map((flake) => (
          <svg
            key={flake.id}
            ref={(el) => {
              if (el) flakeRefsRef.current.set(flake.id, el);
            }}
            className="absolute"
            style={{
              left: 0,
              top: 0,
              opacity: flake.opacity,
              transform: `translate3d(${flake.x}px, ${flake.y}px, 0) rotate(${flake.rotation}deg)`,
              transformOrigin: 'center',
              willChange: 'transform',
              contain: 'layout style paint',
            }}
            width={flake.size * 2.5}
            height={flake.size * 2.5}
            viewBox={`-${flake.size * 1.25} -${flake.size * 1.25} ${flake.size * 2.5} ${flake.size * 2.5}`}
          >
            <polygon
              points={flake.points}
              fill="#212121"
              stroke="#212121"
              strokeWidth="1"
            />
          </svg>
        ))}
      </div>
      
      {/* Snow piles on buttons - disabled when collisions are off */}
      {COLLISIONS_ENABLED && snowPiles.map((button) => {
        // Don't show pile if it's falling (chunks will be shown instead)
        if (button.pileHeight <= 0 || button.isFalling) return null;
        
        // Pile width slightly narrower than button width
        const pileWidth = button.width * 0.95; // 95% of button width
        const pileLeft = button.x + (button.width - pileWidth) / 2; // Center the narrower pile
        
        return (
          <div 
            key={button.id} 
            className="absolute pointer-events-none" 
            style={{ 
              zIndex: 45,
              transition: 'height 0.1s ease-out, width 0.1s ease-out, left 0.1s ease-out',
            }}
          >
            {/* Base fluffy layer with soft gradient */}
            <div
              className="absolute"
              style={{
                left: `${pileLeft}px`,
                top: `${button.y - button.pileHeight}px`,
                width: `${pileWidth}px`,
                height: `${button.pileHeight}px`,
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 30%, rgba(255, 255, 255, 0.75) 70%, rgba(255, 255, 255, 0.65) 100%)',
                borderRadius: `${pileWidth / 2}px ${pileWidth / 2}px ${Math.min(button.pileHeight * 0.8, 24)}px ${Math.min(button.pileHeight * 0.8, 24)}px`,
                boxShadow: `
                  0 -3px 12px rgba(0, 0, 0, 0.15),
                  0 -1px 4px rgba(0, 0, 0, 0.1),
                  inset 0 2px 4px rgba(255, 255, 255, 0.8),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.05)
                `,
                filter: 'blur(0.5px)',
              }}
            />
            {/* Top highlight layer for extra fluffiness */}
            <div
              className="absolute"
              style={{
                left: `${pileLeft}px`,
                top: `${button.y - button.pileHeight}px`,
                width: `${pileWidth}px`,
                height: `${Math.min(button.pileHeight * 0.4, 12)}px`,
                background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                borderRadius: `${pileWidth / 2}px ${pileWidth / 2}px 0 0`,
                pointerEvents: 'none',
              }}
            />
            {/* Soft edge glow */}
            <div
              className="absolute"
              style={{
                left: `${pileLeft - 2}px`,
                top: `${button.y - button.pileHeight - 1}px`,
                width: `${pileWidth + 4}px`,
                height: `${button.pileHeight + 2}px`,
                background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                borderRadius: `${(pileWidth + 4) / 2}px ${(pileWidth + 4) / 2}px ${Math.min((button.pileHeight + 2) * 0.8, 26)}px ${Math.min((button.pileHeight + 2) * 0.8, 26)}px`,
                filter: 'blur(3px)',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          </div>
        );
      })}
      
      {/* Falling snow chunks triggered by piles - disabled when collisions are off */}
      {COLLISIONS_ENABLED && fallingChunks.map((chunk) => (
        <div
          key={chunk.id}
          ref={(el) => {
            if (el) chunkRefsRef.current.set(chunk.id, el);
          }}
          className="absolute pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: `${chunk.width}px`,
            height: `${chunk.height}px`,
            transform: `translate(-50%, -50%) translate3d(${chunk.x}px, ${chunk.y}px, 0) rotate(${chunk.rotation}deg)`,
            transformOrigin: 'center',
            opacity: chunk.opacity,
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 30%, rgba(255, 255, 255, 0.75) 70%, rgba(255, 255, 255, 0.65) 100%)',
            borderRadius: `${Math.min(chunk.width / 2, 12)}px ${Math.min(chunk.width / 2, 12)}px ${Math.min(chunk.height * 0.8, 20)}px ${Math.min(chunk.height * 0.8, 20)}px`,
            boxShadow: `
              0 -2px 8px rgba(0, 0, 0, 0.15),
              0 -1px 3px rgba(0, 0, 0, 0.1),
              inset 0 1px 2px rgba(255, 255, 255, 0.8)
            `,
            filter: 'blur(0.5px)',
            zIndex: 46,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
});
