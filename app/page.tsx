"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
      {/* Header floating at the top */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-[#040404] pt-4 pb-0">
        <Header />
      </div>
      {/* Hero Section */}
      <section className="relative hero-background flex items-center justify-center overflow-hidden" style={{ height: '100vh', width: '100vw', paddingTop: '100px' }}>
        <Snowfall startDelay={2} flakeCount={150} />
        
        {/* Container for all hero content */}
        <div className="relative w-full px-4 sm:px-6 lg:px-8 z-50">
          <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 min-h-[400px]">
            {/* Combined container: Image, Description, and CTA - starts from center */}
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Ski Boot Image Container - left side */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 1.3,
                  duration: 1.0,
                  ease: "easeOut"
                }}
                className="flex-shrink-0 order-2 lg:order-1 w-full lg:w-auto flex justify-center lg:-ml-[250px]"
              >
                <Image 
                  src="/images/Boots/Shift_supra_100.png" 
                  alt="Salomon Shift Supra 100 Ski Boot" 
                  width={450}
                  height={600}
                  className="w-[clamp(220px,28vw,450px)] h-auto object-contain"
                  style={{
                    mixBlendMode: 'screen',
                    filter: 'contrast(1.1) brightness(1.1)'
                  }}
                  priority
                  quality={90}
                />
              </motion.div>

              {/* Description and CTA Container - starts from center */}
              <motion.div 
                className="flex flex-col items-center lg:items-start gap-8 w-full max-w-md order-1 lg:order-2 pl-0"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1
                }}
                transition={{
                  delay: 1.3,
                  duration: 1.0,
                  ease: "easeOut"
                }}
              >
              {/* Description */}
              <div className="text-center lg:text-left pl-0" style={{ maxWidth: 'calc(28rem - 30px)' }}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl whitespace-nowrap font-bold block mb-6 leading-tight" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#F5E4D0' }}>
                  Skip the guess work!
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl block mb-8 text-[#F4F4F4]/90 leading-relaxed">
                  Get matched in minutes with data-driven fitting.
                </p>
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 1.3,
                  duration: 1.0,
                  ease: "easeOut"
                }}
                className="w-full sm:w-auto"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[#F5E4D0] w-full sm:w-auto"
                >
                  <Link href="/quiz" prefetch={false}>START FITTING</Link>
                </Button>
              </motion.div>
            </motion.div>
            </div>
          </div>
        </div>
      </section>
      <main className="bg-[#040404]">

        {/* Brand Section */}
        <section className="py-16 bg-[#040404]">
          <div className="w-full px-4 sm:px-8 md:px-[50px]">
            <div className="w-[90%] mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-[#F4F4F4] mb-8"
            >
              Compare 100's of Boots from Major Brands
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-8 text-[#F4F4F4]/80"
            >
              <span>Salomon</span>
              <span>Atomic</span>
              <span>Rossignol</span>
              <span>Nordica</span>
              <span>Tecnica</span>
              <span>Lange</span>
              <span>Head</span>
              <span>K2</span>
              <span>Dalbello</span>
              <span>Fischer</span>
            </motion.div>
            </div>
          </div>
        </section>

        {/* 3-Step Explainer */}
        <section className="py-16 bg-[#040404]">
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