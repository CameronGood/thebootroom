"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FittingAdviceGuide from "@/components/FittingAdviceGuide";
import { motion } from "framer-motion";
import { Ruler, CheckCircle2, AlertCircle, Wrench } from "lucide-react";

export default function FittingAdvicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#040404] pt-32 sm:pt-36 md:pt-40 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F4F4] mb-4">
              Expert Fitting Advice
            </h1>
            <p className="text-xl text-[#F4F4F4]/70 max-w-3xl mx-auto">
              Comprehensive guide to getting the perfect fit for your ski boots and maximizing your performance on the slopes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FittingAdviceGuide />
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

