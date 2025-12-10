"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FittingAdviceGuide from "@/components/FittingAdviceGuide";
import { motion } from "framer-motion";

export default function FittingAdvicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#1A1C1E] pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#F5E4D0] mb-4">
              Fitting Advice
            </h1>
            <p className="text-lg text-[#F4F4F4]/80">
              Comprehensive guide to getting the perfect fit for your ski boots
            </p>
          </motion.div>

          <FittingAdviceGuide />
        </div>
      </main>
      <Footer />
    </>
  );
}

