"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const motionDivRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRightRef = useRef<HTMLElement>(null);
  const [glowBarStyle, setGlowBarStyle] = useState<{ left: number; width: number } | null>(null);

  // Calculate glow bar position
  useEffect(() => {
    const updateGlowBarPosition = () => {
      if (logoRef.current && navRightRef.current && motionDivRef.current) {
        const logoRect = logoRef.current.getBoundingClientRect();
        const navRect = navRightRef.current.getBoundingClientRect();
        const motionDivRect = motionDivRef.current.getBoundingClientRect();
        
        // Calculate position relative to the motion.div container
        const logoLeft = logoRect.left - motionDivRect.left;
        const navRight = navRect.right - motionDivRect.left;
        
        // Get support extension based on screen size
        // Supports extend: mobile 0.5rem (8px), sm 0.625rem (10px), md+ 0.75rem (12px)
        const isSmall = window.innerWidth < 640;
        const isMedium = window.innerWidth >= 640 && window.innerWidth < 768;
        const supportExtension = isSmall ? 8 : isMedium ? 10 : 12;
        
        // The glow bar container should start where the left support starts (logo - support extension)
        // and be wide enough so the right support ends at navRight
        // Slightly reduce to account for supports being part of the total width
        const left = logoLeft - supportExtension;
        // Width includes the glow bar plus both supports extending outward, but adjust slightly
        const baseWidth = navRight - logoLeft;
        const width = baseWidth + (supportExtension * 2) - 4; // Small reduction for better fit
        
        // Only set if we have valid values
        if (width > 0) {
          setGlowBarStyle({ left, width });
        }
      }
    };

    // Multiple attempts to ensure it runs
    updateGlowBarPosition();
    
    const timeoutId1 = setTimeout(updateGlowBarPosition, 50);
    const timeoutId2 = setTimeout(updateGlowBarPosition, 200);
    const timeoutId3 = setTimeout(updateGlowBarPosition, 500);
    
    window.addEventListener('resize', updateGlowBarPosition);
    
    return () => {
      window.removeEventListener('resize', updateGlowBarPosition);
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] w-full bg-[#040404] pt-2 pb-0 flex flex-col items-center pointer-events-none">
      <div className="w-full px-4 md:px-[50px] flex flex-col items-center">
      <motion.div
        ref={motionDivRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full relative z-[9999] pointer-events-auto"
        style={{ perspective: "1000px" }}
      >
        <div 
          className="backdrop-blur-md shadow-2xl border border-[#F5E4D0]/20 rounded-lg px-6 sm:px-8 md:px-12 py-3 flex justify-between items-center relative overflow-visible z-50"
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(12px) saturate(150%)',
            WebkitBackdropFilter: 'blur(12px) saturate(150%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/" prefetch={false} ref={logoRef} className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#F5E4D0] hidden sm:inline">
                  TheBootRoom
                </span>
                <span className="text-xl font-bold text-[#F5E4D0] sm:hidden">
                  TBR
                </span>
              </Link>
            </motion.div>
          </div>

          <nav ref={navRightRef} className="flex items-center gap-4 sm:gap-6" aria-label="Main navigation">

            {user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-white hover:text-[#F5E4D0] hover:bg-[#F5E4D0]/10"
                  >
                    <Link href="/account" prefetch={false} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">
                        ACCOUNT
                      </span>
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-white hover:text-red-400 hover:bg-red-400/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2 font-medium">
                      LOGOUT
                    </span>
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[#F4F4F4] hover:text-[#F5E4D0] hover:bg-[#F5E4D0]/10"
                >
                  <Link href="/account" prefetch={false} className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Login</span>
                  </Link>
                </Button>
              </motion.div>
            )}
          </nav>
        </div>

      {/* Glow bar and supports hanging below header */}
        <div className="absolute z-[45] pointer-events-none" style={{ left: `${glowBarStyle?.left || 0}px`, width: `${glowBarStyle?.width || 200}px`, top: '100%' }}>
        {/* Glow bar container */}
            <div className="relative w-full">
          {/* Glow bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.9, 0, 0.9, 0, 0.9]
            }}
            transition={{
              delay: 0.3,
              duration: 1.0,
              ease: "easeInOut",
              opacity: {
                times: [0, 0.3, 0.5, 0.7, 0.9, 1],
                duration: 1.0
              }
            }}
                className="relative z-[45] h-[16px] sm:h-[18px] md:h-[20px] w-full"
            style={{
              background: 'linear-gradient(to right, transparent 0%, transparent 1%, rgb(244, 244, 244) 3%, rgb(244, 244, 244) 97%, transparent 99%, transparent 100%)',
              boxShadow: '0 0 15px rgba(244, 244, 244, 0.5), 0 0 30px rgba(244, 244, 244, 0.3)',
              filter: 'drop-shadow(0 0 6px rgba(244, 244, 244, 0.7)) drop-shadow(0 0 12px rgba(244, 244, 244, 0.5))'
            }}
          >
            {/* Additional glow layer behind the glow bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.7, 0, 0.7, 0, 0.7]
              }}
              transition={{
                delay: 0.3,
                duration: 1.0,
                ease: "easeInOut",
                opacity: {
                  times: [0, 0.3, 0.5, 0.7, 0.9, 1],
                  duration: 1.0
                }
              }}
              className="absolute inset-0 h-[24px] sm:h-[28px] md:h-[32px]"
              style={{
                background: 'linear-gradient(to right, transparent 0%, transparent 1%, rgb(244, 244, 244) 3%, rgb(244, 244, 244) 97%, transparent 99%, transparent 100%)',
                filter: 'blur(10px)',
                opacity: 0.5
              }}
            ></motion.div>
          </motion.div>

          {/* Hanging supports connecting header to glow bar - spanning from header to glow bar */}
          <div
                className="absolute left-0 -translate-x-[0.5rem] sm:-translate-x-[0.625rem] md:-translate-x-[0.75rem] top-0 z-[45] w-2 sm:w-2.5 md:w-3 h-4 sm:h-5 md:h-6 bg-[#0a0a0a]"
            style={{ transformOrigin: 'top center' }}
          ></div>
          <div
                className="absolute right-0 translate-x-[0.5rem] sm:translate-x-[0.625rem] md:translate-x-[0.75rem] top-0 z-[45] w-2 sm:w-2.5 md:w-3 h-4 sm:h-5 md:h-6 bg-[#0a0a0a]"
            style={{ transformOrigin: 'top center' }}
          ></div>
        </div>
          </div>
      </motion.div>
      </div>
    </header>
  );
}
