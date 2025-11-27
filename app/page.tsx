"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandBanner from "@/components/BrandBanner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#2B2D30]">
      <main className="flex-grow bg-[#2B2D30]">
        {/* Hero Section */}
        <section
          className="relative pt-0 pb-20 min-h-screen flex items-center justify-center overflow-hidden bg-gray-900"
          style={{
            backgroundImage: "url(/hero-background.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          {/* Header positioned absolutely over hero at the very top */}
          <div className="absolute top-0 left-0 right-0 z-50">
            <div className="pt-4">
              <Header />
            </div>
          </div>

          {/* Overlay for text readability - very subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/25"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-bold text-[#F4F4F4] mb-6 drop-shadow-lg"
            >
              Find Your Perfect Ski Boots
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-[#F4F4F4]/95 mb-8 max-w-2xl mx-auto drop-shadow-md"
            >
              Take our quick 10-step fitting quiz to discover the best-fitting
              ski boots tailored to your feet, ability, and preferences.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] shadow-lg"
              >
                <Link href="/quiz">Start Fitting</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Brand Banner */}
        <BrandBanner
          brands={[
            { name: "Salomon", logo: "/brands/salomon.svg" },
            { name: "Atomic", logo: "/brands/atomic.svg" },
            { name: "Rossignol", logo: "/brands/rossignol.svg" },
            { name: "Nordica", logo: "/brands/nordica.svg" },
            { name: "Tecnica", logo: "/brands/tecnica.svg" },
            { name: "Lange", logo: "/brands/lange.svg" },
            { name: "Head", logo: "/brands/head.svg" },
            { name: "K2", logo: "/brands/k2.svg" },
            { name: "Dalbello", logo: "/brands/dalbello.svg" },
            { name: "Fischer", logo: "/brands/fischer.svg" },
          ]}
          autoRotateInterval={3000}
        />

        {/* 3-Step Explainer */}
        <section className="py-16 bg-[#2B2D30]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {[
                {
                  number: 1,
                  title: "Take the Quiz",
                  description:
                    "Answer 10 simple questions about your feet, skiing ability, and preferences.",
                },
                {
                  number: 2,
                  title: "Get Matched",
                  description:
                    "Our algorithm finds the top 3 boots that best fit your specific requirements.",
                },
                {
                  number: 3,
                  title: "Buy & Save",
                  description:
                    "Purchase through our affiliate links and save your results for later.",
                },
              ].map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <motion.div
                        className="bg-[#F5E4D0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="text-2xl font-bold text-[#2B2D30]">
                          {step.number}
                        </span>
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2 text-[#F4F4F4]">
                        {step.title}
                      </h3>
                      <p className="text-[#F4F4F4]/80">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
