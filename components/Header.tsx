"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, LogIn, Play } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 rounded-full px-4 sm:px-6 py-3 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              <span className="text-xl font-bold text-blue-600 hidden sm:inline">
                TheBootRoom
              </span>
              <span className="text-xl font-bold text-blue-600 sm:hidden">
                TBR
              </span>
            </Link>
          </motion.div>
          
          <nav className="flex items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-blue-600 hover:bg-gray-100">
                <Link href="/quiz" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Start Fitting</span>
                  <span className="sm:hidden font-medium">Quiz</span>
                </Link>
              </Button>
            </motion.div>
            
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-blue-600 hover:bg-gray-100">
                    <Link href="/account" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Account</span>
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-gray-900 hover:text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2 font-medium">Logout</span>
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-blue-600 hover:bg-gray-100">
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

