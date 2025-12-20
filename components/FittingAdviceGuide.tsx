"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Ruler, CheckCircle2, AlertCircle, Wrench, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Section {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export default function FittingAdviceGuide() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close sections
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenSections(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isOpen = (sectionId: string) => openSections.has(sectionId);

  const sections: Section[] = [
    {
      id: "sizing-new",
      title: "Sizing",
      icon: Ruler,
      content: (
        <div className="space-y-4">
          <p className="text-[#F4F4F4] leading-relaxed">
            Your boots should fit snugly - much tighter than regular shoes. A properly fitting ski boot should feel uncomfortably tight when you first try it on in the shop. You should feel pressure on your instep, around your heel, and on the sides of your foot. Your toes should brush against the front of the boot when standing, but not be curled or crammed.
          </p>
          <div className="bg-[#F5E4D0]/10 border border-[#F5E4D0]/20 rounded-lg p-4">
            <p className="text-[#F4F4F4]/90 leading-relaxed">
              <strong className="text-[#F5E4D0]">Remember:</strong> Boots will pack out (liners compress) approximately 5-10mm over the first 10-20 days of skiing. If a boot feels "comfortable" in the shop, it will be too loose after break-in.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "fit-testing",
      title: "Proper Fit Testing",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-[#F4F4F4] mb-4 leading-relaxed">
            Testing your boot fit properly ensures you'll have the best possible skiing experience. Follow these steps:
          </p>
          <ol className="space-y-3">
            {[
              {
                step: "Try on with proper socks",
                detail: "Use your actual ski socks (thin, synthetic, no cotton). Put on both boots.",
              },
              {
                step: "Buckling sequence",
                detail: "Start with the top two buckles (near your calf) relatively loose. Buckle the instep buckle (across the top of your foot) firmly - this is crucial for heel hold. Buckle the toe buckle just snug. Then tighten the top buckles.",
              },
              {
                step: "Stand up and flex forward",
                detail: "You should feel pressure on your shins. Your heel should stay locked in place without lifting.",
              },
              {
                step: "Check heel hold",
                detail: "Stand on your toes - your heel should not lift more than 2-3mm. If it lifts significantly, you need better heel hold (instep pad, different boot, or shell modification).",
              },
              {
                step: "Forward flex test",
                detail: "Flex forward as if skiing. The boot should flex smoothly at the ankle, not at the instep. You should feel progressive resistance.",
              },
              {
                step: "Walk around",
                detail: "The boot will feel stiff and awkward - this is normal. Check for any specific pressure points or areas of discomfort.",
              },
              {
                step: "Time test",
                detail: "Wear the boots for at least 15-20 minutes. Initial tightness should ease slightly, but the boots should still feel snug. Painful pressure points indicate needed adjustments.",
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 bg-gradient-to-r from-[#2B2D30] to-[#1a1a1a] border border-[#F5E4D0]/10 rounded-lg p-4 hover:border-[#F5E4D0]/20 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F5E4D0]/20 border border-[#F5E4D0]/30 flex items-center justify-center">
                  <span className="text-[#F5E4D0] font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <strong className="text-[#F5E4D0] font-semibold block mb-1.5">{item.step}</strong>
                  <p className="text-[#F4F4F4]/80 leading-relaxed">{item.detail}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      id: "break-in",
      title: "Break-In Period Expectations",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-[#F4F4F4] mb-4 leading-relaxed">
            Your new boots will need time to break in. Understanding what to expect helps set realistic expectations.
          </p>
          <div className="space-y-3">
            {[
              {
                period: "First Day",
                description: "Boots will feel very tight and stiff. You may experience some discomfort or pressure points. This is normal. Take breaks throughout the day and don't over-tighten buckles.",
              },
              {
                period: "Days 2-5",
                description: "Liners begin to pack out (compress). You'll notice the boots feeling slightly more comfortable. Any major pressure points should be addressed now - consider professional fitting adjustments.",
              },
              {
                period: "Days 6-10",
                description: "Significant packing occurs. Boots will feel noticeably looser. This is when you might need to add padding or adjust buckles more firmly.",
              },
              {
                period: "Days 11-20",
                description: "Most packing is complete. Boots should now feel comfortable but still snug. Final adjustments should be made during this period.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-[#2B2D30] to-[#1a1a1a] border border-[#F5E4D0]/10 rounded-lg p-4 hover:border-[#F5E4D0]/20 transition-colors"
              >
                <strong className="text-[#F5E4D0] font-semibold block mb-2 text-lg">{item.period}</strong>
                <p className="text-[#F4F4F4]/80 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "common-issues",
      title: "Troubleshooting Common Fit Issues",
      icon: AlertCircle,
      content: (
        <div className="space-y-3">
          {[
            {
              issue: "Cold toes",
              solution: "Often caused by boots too tight or buckles over-tightened. Try loosening toe buckle and ensure proper circulation. If persistent, may need shell modification for more toe room.",
            },
            {
              issue: "Heel lift",
              solution: "Tighten instep buckle more firmly, add instep pad, or consider heel pad. If severe, may need different boot model or professional shell work.",
            },
            {
              issue: "Numbness or pressure points",
              solution: "Identify exact location. Try padding adjacent areas to redistribute pressure. If doesn't resolve, shell modification (punching or grinding) may be necessary.",
            },
            {
              issue: "Shin bang (pain on shins)",
              solution: "Usually from boots too large or improper forward flex. Ensure proper fit and buckle sequence. May need different boot size or model.",
            },
            {
              issue: "Boot too loose after break-in",
              solution: "Add padding strategically (instep, heel, ankle pads). If still too loose, boots may be too large - consider professional assessment for potential downsizing.",
            },
            {
              issue: "Pain on outside of little toe",
              solution: "Common with wider feet. Shell punching in the forefoot area usually resolves this. Don't ignore - can lead to numbness.",
            },
            {
              issue: "Pressure on top of foot/instep",
              solution: "May need shell punching to create more vertical space. Also try loosening instep buckle slightly, but ensure heel hold is maintained.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-r from-[#2B2D30] to-[#1a1a1a] border border-[#F5E4D0]/10 rounded-lg p-4 hover:border-[#F5E4D0]/20 transition-colors"
            >
              <strong className="text-[#F5E4D0] font-semibold block mb-2">{item.issue}</strong>
              <p className="text-[#F4F4F4]/80 leading-relaxed">{item.solution}</p>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      id: "maintaining-fit",
      title: "Maintaining Fit Over Time",
      icon: Wrench,
      content: (
        <div className="space-y-3">
          {[
            {
              topic: "After skiing",
              description: "Remove liners from shells and allow both to dry thoroughly. Don't place boots near heaters - this can deform the shell. Use boot dryers or simply air dry at room temperature.",
            },
            {
              topic: "Liner maintenance",
              description: "Wash liners periodically (check manufacturer instructions) with appropriate products. Don't machine dry - air dry only. This prevents odor and maintains liner shape.",
            },
            {
              topic: "Shell care",
              description: "Keep shells clean and check for cracks or damage. Clean buckles and ensure they function smoothly. Lubricate buckles if they become stiff.",
            },
            {
              topic: "Long-term fit",
              description: "Liners continue to pack out slightly over multiple seasons. You may need to add padding over time. After 50-100 days of skiing, consider professional re-fitting or liner replacement to maintain optimal fit.",
            },
            {
              topic: "Storage",
              description: "Store boots buckled to maintain shell shape. Don't store in extreme temperatures. Keep in a dry location to prevent mold and odor.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-r from-[#2B2D30] to-[#1a1a1a] border border-[#F5E4D0]/10 rounded-lg p-4 hover:border-[#F5E4D0]/20 transition-colors"
            >
              <strong className="text-[#F5E4D0] font-semibold block mb-2">{item.topic}</strong>
              <p className="text-[#F4F4F4]/80 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6" ref={containerRef}>
      <div className="space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const open = isOpen(section.id);
          
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-[#F5E4D0]/30 bg-gradient-to-br from-[#2B2D30] to-[#1a1a1a] hover:border-[#F5E4D0]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(245,228,208,0.1)]">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#2B2D30]/50 transition-colors duration-200 rounded-t-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#F5E4D0]/10 border border-[#F5E4D0]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#F5E4D0]" />
                    </div>
                    <h4 className="text-xl font-bold text-[#F4F4F4]">
                      {section.title}
                    </h4>
                  </div>
                  {open ? (
                    <ChevronUp className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4 transition-transform" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4 transition-transform" />
                  )}
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <CardContent className="px-6 pb-6 pt-0 border-t border-[#F5E4D0]/10 mt-4">
                        <div className="pt-4 text-base leading-relaxed">
                          {section.content}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
