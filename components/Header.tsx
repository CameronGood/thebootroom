"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full px-[50px]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="bg-[#2B2D30]/60 backdrop-blur-md shadow-lg border border-[#F5E4D0]/20 rounded-md px-4 sm:px-6 py-3 flex justify-between items-center">
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

          <nav className="flex items-center gap-2 sm:gap-3">

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
                    className="rounded-full text-[#F4F4F4] hover:text-[#F5E4D0] hover:bg-[#F5E4D0]/10"
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
                    className="rounded-full text-[#F4F4F4] hover:text-red-400 hover:bg-red-400/10"
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
    </header>
  );
}
