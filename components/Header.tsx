"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn } from "lucide-react";
import React from "react";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full px-[50px] pt-4 pb-0 flex flex-col items-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-[90%] relative z-[100] pointer-events-auto"
      >
        <div 
          className="backdrop-blur-md shadow-2xl border border-[#F5E4D0]/20 rounded-lg px-6 sm:px-8 md:px-12 py-3 flex justify-between items-center relative"
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(12px) saturate(150%)',
            WebkitBackdropFilter: 'blur(12px) saturate(150%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#F5E4D0] hidden sm:inline">
                TheBootRoom
              </span>
              <span className="text-xl font-bold text-[#F5E4D0] sm:hidden">
                TBR
              </span>
            </Link>
          </motion.div>

          <nav className="flex items-center gap-4 sm:gap-6">

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
                    <Link href="/account" className="flex items-center gap-2">
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
                  <Link href="/account" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Login</span>
                  </Link>
                </Button>
              </motion.div>
            )}
          </nav>
        </div>
      </motion.div>

      {/* Glow bar and supports hanging below header */}
      <div className="relative w-[70%] mt-4 flex justify-center items-start z-40">
        {/* Glow bar container */}
        <div className="relative w-full max-w-full -mt-4">
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
            className="relative z-40 h-[16px] sm:h-[18px] md:h-[20px] w-full max-w-full"
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
            className="absolute left-0 -translate-x-[0.5rem] sm:-translate-x-[0.625rem] md:-translate-x-[0.75rem] top-0 z-40 w-2 sm:w-2.5 md:w-3 h-4 sm:h-5 md:h-6 bg-[#0a0a0a]"
            style={{ transformOrigin: 'top center' }}
          ></div>
          <div
            className="absolute right-0 translate-x-[0.5rem] sm:translate-x-[0.625rem] md:translate-x-[0.75rem] top-0 z-40 w-2 sm:w-2.5 md:w-3 h-4 sm:h-5 md:h-6 bg-[#0a0a0a]"
            style={{ transformOrigin: 'top center' }}
          ></div>
        </div>
      </div>
    </header>
  );
}
