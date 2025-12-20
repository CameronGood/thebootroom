"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Target, Clock, CheckCircle2, ArrowRight, Filter, BookOpen, Ruler, CheckCircle, Sparkles, FileText, MapPin, Zap, Shield } from "lucide-react";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <Card className="h-full border-[#F5E4D0]/30 bg-gradient-to-br from-[#2B2D30] to-[#1a1a1a] hover:border-[#F5E4D0]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(245,228,208,0.15)]">
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-[#F5E4D0]/10 border border-[#F5E4D0]/20 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-[#F5E4D0]" />
          </div>
          <CardTitle className="text-xl text-[#F4F4F4]">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-[#F4F4F4]/70 text-base leading-relaxed text-center">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative hero-background flex items-center justify-center overflow-hidden" style={{ minHeight: '100vh', width: '100vw', paddingTop: '100px', paddingBottom: '80px' }} aria-label="Hero section">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a] z-10" />
        
        <motion.div 
          className="relative w-[90%] sm:w-[80%] lg:w-[70%] mx-auto z-50 flex flex-col items-center gap-6 lg:gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.3,
            duration: prefersReducedMotion ? 0 : 1.0,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <h1 className="font-medium leading-[1.1] text-[#F4F4F4] w-full text-center" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 'clamp(1.3rem, 4vw, 5rem)' }}>
            Find Boots That Are Right For You
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.7,
              duration: prefersReducedMotion ? 0 : 0.8,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="mt-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[3px] border-[#F5E4D0] hover:border-[#E8D4B8] font-bold text-lg px-8 py-6 rounded-[4px] transition-all duration-200 shadow-[0_4px_16px_rgba(245,228,208,0.3)] hover:shadow-[0_6px_24px_rgba(245,228,208,0.4)] hover:scale-105 w-full sm:w-auto group"
              >
                <Link href="/quiz" className="flex items-center justify-center gap-2">
                  FILTER BOOTS
                  <Filter className="w-5 h-5 group-hover:scale-110 transition-transform relative -top-0.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <main className="bg-[#040404]">
        {/* Features Section */}
        <section className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8" aria-label="Features">
          <div className="max-w-7xl mx-auto">
            <motion.div
              ref={featuresRef}
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F4F4] mb-4">
                How It Works
              </h2>
              <p className="text-xl text-[#F4F4F4]/70 max-w-2xl mx-auto">
                We make finding the perfect ski boot simple, personalized, and stress-free.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <FeatureCard
                icon={Filter}
                title="Smart Filtering"
                description="Answer a few quick questions about your skiing style, foot shape, and preferences. Our algorithm narrows down hundreds of options to boots that will work for you."
                delay={0.1}
              />
              <FeatureCard
                icon={Target}
                title="Personalized Matches"
                description="Get recommendations tailored specifically to your needs. No more guessing or overwhelming choices."
                delay={0.2}
              />
              <FeatureCard
                icon={Clock}
                title="Save Time & Money"
                description="Skip the trial and error. Find boots that work for you faster, reducing returns and ensuring you get the right fit."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8" aria-label="Benefits">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F4F4] mb-4">
                What We Provide
              </h2>
              <p className="text-xl text-[#F4F4F4]/70 max-w-2xl mx-auto">
                Everything you need to find the perfect ski boot match
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "Personalized Recommendations",
                  description: "Get boot recommendations tailored specifically to your profile, skiing style, and foot shape"
                },
                {
                  icon: FileText,
                  title: "Detailed Breakdowns",
                  description: "Understand exactly why each boot matches you with comprehensive fitting explanations"
                },
                {
                  icon: Ruler,
                  title: "Expert Fitting Advice",
                  description: "Access professional guidance to ensure proper sizing and optimal boot performance"
                },
                {
                  icon: MapPin,
                  title: "Boot Fitter Locations",
                  description: "Find professional boot fitter locations near you for in-person fitting assistance"
                },
                {
                  icon: Zap,
                  title: "Save Time",
                  description: "Eliminate unsuitable options quickly and focus on boots that actually work for you"
                },
                {
                  icon: Shield,
                  title: "Confident Decisions",
                  description: "Make informed choices with detailed information and expert-backed recommendations"
                }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.5,
                      delay: prefersReducedMotion ? 0 : index * 0.1
                    }}
                  >
                    <Card className="h-full border-[#F5E4D0]/30 bg-gradient-to-br from-[#2B2D30] to-[#1a1a1a] hover:border-[#F5E4D0]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(245,228,208,0.15)] group">
                      <CardHeader className="flex flex-col items-center text-center space-y-1.5 p-6">
                        <div className="w-12 h-12 rounded-lg bg-[#F5E4D0]/10 border border-[#F5E4D0]/20 flex items-center justify-center mb-4 group-hover:bg-[#F5E4D0]/20 group-hover:border-[#F5E4D0]/40 transition-all duration-300">
                          <Icon className="w-6 h-6 text-[#F5E4D0] group-hover:scale-110 transition-transform" />
                        </div>
                        <CardTitle className="text-xl text-[#F4F4F4] mb-2">{benefit.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-[#F4F4F4]/70 text-base leading-relaxed text-center">
                          {benefit.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Fitting Advice Section */}
        <section className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#040404] to-[#0a0a0a]" aria-label="Fitting advice">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F4F4] mb-4">
                Expert Fitting Advice
              </h2>
              <p className="text-xl text-[#F4F4F4]/70 max-w-3xl mx-auto">
                Learn how to get the perfect fit for your ski boots with our comprehensive fitting guide. Get the most out of your boots with expert tips and techniques.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  icon: Ruler,
                  title: "Proper Sizing",
                  description: "Learn how to measure and select the right boot size for your feet"
                },
                {
                  icon: CheckCircle,
                  title: "Fit Testing",
                  description: "Master the techniques to test and verify your boot fit"
                },
                {
                  icon: BookOpen,
                  title: "Comprehensive Guide",
                  description: "Access detailed advice on getting the most out of your boots"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.5,
                      delay: prefersReducedMotion ? 0 : index * 0.1
                    }}
                  >
                    <Card className="h-full border-[#F5E4D0]/30 bg-gradient-to-br from-[#2B2D30] to-[#1a1a1a] hover:border-[#F5E4D0]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(245,228,208,0.15)]">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-[#F5E4D0]/10 border border-[#F5E4D0]/20 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-[#F5E4D0]" />
                        </div>
                        <CardTitle className="text-xl text-[#F4F4F4]">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-[#F4F4F4]/70 text-base leading-relaxed text-center">
                          {item.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.3 }}
              className="text-center"
            >
              <Button
                asChild
                size="lg"
                className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[3px] border-[#F5E4D0] hover:border-[#E8D4B8] font-bold text-lg px-10 py-7 rounded-[4px] transition-all duration-200 shadow-[0_4px_16px_rgba(245,228,208,0.3)] hover:shadow-[0_6px_24px_rgba(245,228,208,0.4)] hover:scale-105 group"
              >
                <Link href="/fitting-advice" className="flex items-center gap-2">
                  View Fitting Advice Guide
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0a0a0a] to-[#040404]" aria-label="Call to action">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F4F4] mb-6">
                Ready to Find Your Perfect Boot?
              </h2>
              <p className="text-xl text-[#F4F4F4]/70 mb-8 max-w-2xl mx-auto">
                Stop guessing and start matching. Get personalized ski boot recommendations in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[3px] border-[#F5E4D0] hover:border-[#E8D4B8] font-bold text-lg px-10 py-7 rounded-[4px] transition-all duration-200 shadow-[0_4px_16px_rgba(245,228,208,0.3)] hover:shadow-[0_6px_24px_rgba(245,228,208,0.4)] hover:scale-105 w-full sm:w-auto group"
                >
                  <Link href="/quiz" className="flex items-center gap-2">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-[3px] border-[#F5E4D0] hover:bg-[#F5E4D0]/10 text-[#F5E4D0] font-bold text-lg px-10 py-7 rounded-[4px] transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                >
                  <Link href="/fitting-advice">Learn More</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}