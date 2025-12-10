"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  return (
    <div className="mt-10" ref={containerRef}>
      <Card className="bg-[#2B2D30] border-[#F5E4D0]/20 shadow-lg">
        <CardContent className="pt-8 pb-8 px-6 md:px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#F4F4F4] mb-2">
              Fitting Advice to get the most out of your boots
            </h3>
            <p className="text-sm text-[#F4F4F4]/70">
              Comprehensive guide to achieving the perfect fit
            </p>
          </div>

          <div className="space-y-3 text-[#F4F4F4]">
            {/* Sizing */}
            <section className="border border-[#F5E4D0]/20 rounded-lg overflow-hidden bg-[#1A1C1E]">
              <button
                onClick={() => toggleSection("sizing-new")}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#1A1C1E]/80 transition-colors duration-200"
              >
                <h4 className="text-lg font-bold text-[#F5E4D0]">
                  Sizing
                </h4>
                {isOpen("sizing-new") ? (
                  <ChevronUp className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                )}
              </button>
              {isOpen("sizing-new") && (
                <div className="px-5 pb-6 space-y-4 text-[15px] leading-relaxed border-t border-[#F5E4D0]/10 pt-5">
                  <div className="space-y-3">
                    <p className="text-[#F4F4F4]">
                      Your boots should fit snugly - much tighter than regular shoes. A properly fitting ski boot should feel uncomfortably tight when you first try it on in the shop. You should feel pressure on your instep, around your heel, and on the sides of your foot. Your toes should brush against the front of the boot when standing, but not be curled or crammed.
                    </p>
                    <p className="text-[#F4F4F4]/90">
                      Remember: Boots will pack out (liners compress) approximately 5-10mm over the first 10-20 days of skiing. If a boot feels "comfortable" in the shop, it will be too loose after break-in.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Fit Testing */}
            <section className="border border-[#F5E4D0]/20 rounded-lg overflow-hidden bg-[#1A1C1E]">
              <button
                onClick={() => toggleSection("fit-testing")}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#1A1C1E]/80 transition-colors duration-200"
              >
                <h4 className="text-lg font-bold text-[#F5E4D0]">
                  Proper Fit Testing
                </h4>
                {isOpen("fit-testing") ? (
                  <ChevronUp className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                )}
              </button>
              {isOpen("fit-testing") && (
                <div className="px-5 pb-6 space-y-4 text-[15px] leading-relaxed border-t border-[#F5E4D0]/10 pt-5">
                  <p className="text-[#F4F4F4] mb-1">
                    Testing your boot fit properly ensures you'll have the best possible skiing experience. Follow these steps:
                  </p>
                  <ol className="space-y-3.5 ml-2">
                    <li className="flex gap-3 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <span className="text-[#F5E4D0] font-bold flex-shrink-0 w-6">1.</span>
                      <div>
                        <strong className="text-[#F5E4D0] font-semibold block mb-1">Try on with proper socks:</strong>
                        <span className="text-[#F4F4F4]/80">Use your actual ski socks (thin, synthetic, no cotton). Put on both boots.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <span className="text-[#F5E4D0] font-bold flex-shrink-0 w-6">2.</span>
                      <div>
                        <strong className="text-[#F5E4D0] font-semibold block mb-1">Buckling sequence:</strong>
                        <span className="text-[#F4F4F4]/80">Start with the top two buckles (near your calf) relatively loose. Buckle the instep buckle (across the top of your foot) firmly - this is crucial for heel hold. Buckle the toe buckle just snug. Then tighten the top buckles.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <span className="text-[#F5E4D0] font-bold flex-shrink-0 w-6">3.</span>
                      <div>
                        <strong className="text-[#F5E4D0] font-semibold block mb-1">Stand up and flex forward:</strong>
                        <span className="text-[#F4F4F4]/80">You should feel pressure on your shins. Your heel should stay locked in place without lifting.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <span className="text-[#F5E4D0] font-bold flex-shrink-0 w-6">4.</span>
                      <div>
                        <strong className="text-[#F5E4D0] font-semibold block mb-1">Check heel hold:</strong>
                        <span className="text-[#F4F4F4]/80">Stand on your toes - your heel should not lift more than 2-3mm. If it lifts significantly, you need better heel hold (instep pad, different boot, or shell modification).</span>
                      </div>
                    </li>
                    <li className="flex gap-3 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <span className="text-[#F5E4D0] font-bold flex-shrink-0 w-6">5.</span>
                      <div>
                        <strong className="text-[#F5E4D0] font-semibold block mb-1">Forward flex test:</strong>
                        <span className="text-[#F4F4F4]/80">Flex forward as if skiing. The boot should flex smoothly at the ankle, not at the instep. You should feel progressive resistance.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <span className="text-[#F5E4D0] font-bold flex-shrink-0 w-6">6.</span>
                      <div>
                        <strong className="text-[#F5E4D0] font-semibold block mb-1">Walk around:</strong>
                        <span className="text-[#F4F4F4]/80">The boot will feel stiff and awkward - this is normal. Check for any specific pressure points or areas of discomfort.</span>
                      </div>
                    </li>
                    <li className="flex gap-3 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <span className="text-[#F5E4D0] font-bold flex-shrink-0 w-6">7.</span>
                      <div>
                        <strong className="text-[#F5E4D0] font-semibold block mb-1">Time test:</strong>
                        <span className="text-[#F4F4F4]/80">Wear the boots for at least 15-20 minutes. Initial tightness should ease slightly, but the boots should still feel snug. Painful pressure points indicate needed adjustments.</span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}
            </section>

            {/* Break-In Period */}
            <section className="border border-[#F5E4D0]/20 rounded-lg overflow-hidden bg-[#1A1C1E]">
              <button
                onClick={() => toggleSection("break-in")}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#1A1C1E]/80 transition-colors duration-200"
              >
                <h4 className="text-lg font-bold text-[#F5E4D0]">
                  Break-In Period Expectations
                </h4>
                {isOpen("break-in") ? (
                  <ChevronUp className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                )}
              </button>
              {isOpen("break-in") && (
                <div className="px-5 pb-6 space-y-4 text-[15px] leading-relaxed border-t border-[#F5E4D0]/10 pt-5">
                  <p className="text-[#F4F4F4] mb-2">
                    Your new boots will need time to break in. Understanding what to expect helps set realistic expectations.
                  </p>
                  <div className="space-y-3.5">
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">First Day</strong>
                      <p className="text-[#F4F4F4]/80">Boots will feel very tight and stiff. You may experience 
                      some discomfort or pressure points. This is normal. Take breaks throughout the day and don't over-tighten buckles.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Days 2-5</strong>
                      <p className="text-[#F4F4F4]/80">Liners begin to pack out (compress). You'll notice the boots 
                      feeling slightly more comfortable. Any major pressure points should be addressed now - consider professional fitting 
                      adjustments.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Days 6-10</strong>
                      <p className="text-[#F4F4F4]/80">Significant packing occurs. Boots will feel noticeably looser. 
                      This is when you might need to add padding or adjust buckles more firmly.</p>
                    </div>
                    <div className="pb-2 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Days 11-20</strong>
                      <p className="text-[#F4F4F4]/80">Most packing is complete. Boots should now feel comfortable 
                      but still snug. Final adjustments should be made during this period.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Common Issues */}
            <section className="border border-[#F5E4D0]/20 rounded-lg overflow-hidden bg-[#1A1C1E]">
              <button
                onClick={() => toggleSection("common-issues")}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#1A1C1E]/80 transition-colors duration-200"
              >
                <h4 className="text-lg font-bold text-[#F5E4D0]">
                  Troubleshooting Common Fit Issues
                </h4>
                {isOpen("common-issues") ? (
                  <ChevronUp className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                )}
              </button>
              {isOpen("common-issues") && (
                <div className="px-5 pb-6 space-y-3.5 text-[15px] leading-relaxed border-t border-[#F5E4D0]/10 pt-5">
                  <div className="space-y-3.5">
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Cold toes</strong>
                      <p className="text-[#F4F4F4]/80">Often caused by boots too tight or buckles over-tightened. 
                      Try loosening toe buckle and ensure proper circulation. If persistent, may need shell modification for more toe room.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Heel lift</strong>
                      <p className="text-[#F4F4F4]/80">Tighten instep buckle more firmly, add instep pad, or consider 
                      heel pad. If severe, may need different boot model or professional shell work.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Numbness or pressure points</strong>
                      <p className="text-[#F4F4F4]/80">Identify exact location. Try padding adjacent 
                      areas to redistribute pressure. If doesn't resolve, shell modification (punching or grinding) may be necessary.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Shin bang (pain on shins)</strong>
                      <p className="text-[#F4F4F4]/80">Usually from boots too large or improper forward 
                      flex. Ensure proper fit and buckle sequence. May need different boot size or model.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Boot too loose after break-in</strong>
                      <p className="text-[#F4F4F4]/80">Add padding strategically (instep, heel, 
                      ankle pads). If still too loose, boots may be too large - consider professional assessment for potential downsizing.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Pain on outside of little toe</strong>
                      <p className="text-[#F4F4F4]/80">Common with wider feet. Shell punching in 
                      the forefoot area usually resolves this. Don't ignore - can lead to numbness.</p>
                    </div>
                    <div className="pb-2 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Pressure on top of foot/instep</strong>
                      <p className="text-[#F4F4F4]/80">May need shell punching to create more 
                      vertical space. Also try loosening instep buckle slightly, but ensure heel hold is maintained.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Maintaining Fit */}
            <section className="border border-[#F5E4D0]/20 rounded-lg overflow-hidden bg-[#1A1C1E]">
              <button
                onClick={() => toggleSection("maintaining-fit")}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#1A1C1E]/80 transition-colors duration-200"
              >
                <h4 className="text-lg font-bold text-[#F5E4D0]">
                  Maintaining Fit Over Time
                </h4>
                {isOpen("maintaining-fit") ? (
                  <ChevronUp className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 ml-4" />
                )}
              </button>
              {isOpen("maintaining-fit") && (
                <div className="px-5 pb-6 space-y-4 text-[15px] leading-relaxed border-t border-[#F5E4D0]/10 pt-5">
                  <div className="space-y-3.5">
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">After skiing</strong>
                      <p className="text-[#F4F4F4]/80">Remove liners from shells and allow both to dry thoroughly. 
                      Don't place boots near heaters - this can deform the shell. Use boot dryers or simply air dry at room temperature.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Liner maintenance</strong>
                      <p className="text-[#F4F4F4]/80">Wash liners periodically (check manufacturer instructions) 
                      with appropriate products. Don't machine dry - air dry only. This prevents odor and maintains liner shape.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Shell care</strong>
                      <p className="text-[#F4F4F4]/80">Keep shells clean and check for cracks or damage. Clean buckles 
                      and ensure they function smoothly. Lubricate buckles if they become stiff.</p>
                    </div>
                    <div className="pb-3 border-b border-[#F5E4D0]/5 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Long-term fit</strong>
                      <p className="text-[#F4F4F4]/80">Liners continue to pack out slightly over multiple seasons. 
                      You may need to add padding over time. After 50-100 days of skiing, consider professional re-fitting or liner replacement 
                      to maintain optimal fit.</p>
                    </div>
                    <div className="pb-2 bg-[#2B2D30]/30 rounded px-3 py-2.5">
                      <strong className="text-[#F5E4D0] font-semibold block mb-1.5">Storage</strong>
                      <p className="text-[#F4F4F4]/80">Store boots buckled to maintain shell shape. Don't store in extreme 
                      temperatures. Keep in a dry location to prevent mold and odor.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
