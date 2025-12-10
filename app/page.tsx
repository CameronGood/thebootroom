"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";
import dynamic from "next/dynamic";

const Snowfall = dynamic(() => import("@/components/ui/snowfall").then(mod => ({ default: mod.Snowfall })), {
  ssr: false,
  loading: () => null,
});
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
        <Header />
      {/* Hero Section */}
      <section className="relative hero-background flex items-center justify-center overflow-hidden" style={{ height: '100vh', width: '100vw', paddingTop: '100px' }} aria-label="Hero section">
        <Snowfall startDelay={2} flakeCount={150} />
        
        <motion.div 
          className="relative w-[70%] mx-auto z-50 flex flex-col items-center gap-6 lg:gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.3,
            duration: 1.0,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <h1 className="font-bold leading-[1.1] text-[#F5E4D0] whitespace-nowrap w-full text-center flex items-center justify-center gap-8" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 'clamp(1.5rem, 6vw, 7rem)' }}>
            <span className="flex items-center gap-6">
              Skip
              <SkipForward className="w-[0.6em] h-[0.6em] fill-current" style={{ display: 'inline-block' }} />
            </span>
            the guess work!
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-[#F4F4F4]/90 leading-relaxed max-w-3xl mx-auto">
            Get matched in minutes with data-driven fitting. Find your perfect ski boot match.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button
              asChild
              size="lg"
              className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[3px] border-[#F5E4D0] hover:border-[#E8D4B8] font-bold text-lg px-8 py-6 rounded-[4px] transition-all duration-200 shadow-[0_4px_16px_rgba(245,228,208,0.3)] hover:shadow-[0_6px_24px_rgba(245,228,208,0.4)] hover:scale-105 w-full sm:w-auto"
            >
              <Link href="/quiz">START FITTING</Link>
            </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-[3px] border-[#F5E4D0] hover:bg-[#F5E4D0]/10 text-[#F5E4D0] font-bold text-lg px-8 py-6 rounded-[4px] transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                <Link href="/fitting-advice">FITTING ADVICE</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>
      <main className="bg-[#040404]">

        {/* 3-Step Explainer */}
        <section className="py-16 bg-[#040404]" aria-label="How it works">
          <div className="w-full px-4 sm:px-8 md:px-[50px]">
            <div className="w-[90%] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-center mb-12 text-[#F4F4F4]"
            >
              How It Works
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="bg-[#F5E4D0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-[#2B2D30]">1</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-[#F4F4F4]">Take the Quiz</h3>
                    <p className="text-[#F4F4F4]/80">Answer 10 simple questions about your feet, skiing ability, and preferences.</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="bg-[#F5E4D0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-[#2B2D30]">2</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-[#F4F4F4]">Get Matched</h3>
                    <p className="text-[#F4F4F4]/80">Our algorithm finds the top 3 boots that best fit your specific requirements.</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="bg-[#F5E4D0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-[#2B2D30]">3</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-[#F4F4F4]">Buy & Save</h3>
                    <p className="text-[#F4F4F4]/80">Purchase through our affiliate links and save your results for later.</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}