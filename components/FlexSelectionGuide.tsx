"use client";

import { useState, useRef, useEffect } from "react";
import { QuizAnswers, BootSummary } from "@/types";
import { calculateAcceptableFlexRange } from "@/lib/flexRange";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FlexSelectionGuideProps {
  userAnswers: QuizAnswers;
  recommendedBoots?: BootSummary[];
  selectedModels?: Record<string, Set<number>>;
}

interface FlexInfo {
  rating: number;
  plasticsUsed: string;
  linerMaterials: string;
  bestFor: string;
  practicalDifferences: string;
  // New fields for 130 flex
  whoItSuits?: string;
  shellMaterials?: string;
  liners?: string;
  feelControl?: string;
  forgiveness?: string;
}

// Static flex information database
const flexInfoMap: Record<number, FlexInfo> = {
  // Men's flexes
  70: {
    rating: 70,
    plasticsUsed: "Soft PU/polyolefin.",
    linerMaterials: "Soft and plush with a warm, comfort-first feel.",
    bestFor: "Someone completely new to skiing who wants a relaxed, confidence-building boot that won't punish mistakes.",
    practicalDifferences: "Extremely easy to flex and forgiving — ideal for learning balance and basic technique.",
  },
  80: {
    rating: 80,
    plasticsUsed: "Slightly firmer PU.",
    linerMaterials: "Medium-soft and supportive while still relaxed and comfortable.",
    bestFor: "A developing skier gaining control and starting to explore more of the mountain, but still wanting easy, friendly support.",
    practicalDifferences: "A touch more stability and support while still very manageable for progressing skiers.",
  },
  90: {
    rating: 90,
    plasticsUsed: "PU with moderate stiffness.",
    linerMaterials: "Medium-density with good structure for all-day comfort.",
    bestFor: "A skier who is comfortable on most pistes and wants a boot that helps them carve more cleanly without feeling demanding.",
    practicalDifferences: "Better edge control and stability across a wider range of conditions.",
  },
  100: {
    rating: 100,
    plasticsUsed: "PU or bi-injected PU.",
    linerMaterials: "Firm and supportive with a more performance-orientated fit.",
    bestFor: "A confident skier who likes to ski faster or tackle mixed terrain and wants stronger support without entering \"expert-only\" stiffness.",
    practicalDifferences: "Stable, controlled feel in variable snow while remaining comfortable for resort days.",
  },
  110: {
    rating: 110,
    plasticsUsed: "PU/Grilamid or reinforced materials.",
    linerMaterials: "Dense and performance-focused with a firm supportive feel.",
    bestFor: "Athletic skier that wants a direct, responsive connection to their skis.",
    practicalDifferences: "More immediate response and strong support for committed, fast skiing.",
  },
  120: {
    rating: 120,
    plasticsUsed: "Very stiff PU/Grilamid blend with reinforced construction.",
    linerMaterials: "Performance liner with firm support and precise heel hold.",
    bestFor: "Advanced skiers who want strong, responsive support for aggressive skiing and high speeds.",
    practicalDifferences: "Very stiff and responsive — provides excellent power transfer and control for committed, dynamic skiing.",
  },
  130: {
    rating: 130,
    plasticsUsed: "Race-grade PU/Grilamid with maximum torsional rigidity and reinforced shell construction.",
    linerMaterials: "Low-bulk, race-inspired liner with minimal padding, firm structure, and a cooler, more direct feel.",
    bestFor: "Expert and race-level skiers who demand absolute maximum control and precision in every movement.",
    practicalDifferences: "Extremely stiff and unforgiving — built for maximum energy transfer, instant response, and race-level performance. Not suitable for casual or recreational skiing.",
  },
  140: {
    rating: 140,
    plasticsUsed: "Ultra-stiff race construction with carbon fiber reinforcements and maximum shell rigidity.",
    linerMaterials: "Minimal race liner with extremely firm support, minimal cushioning for direct power transfer.",
    bestFor: "World Cup racers and elite-level competitors who require absolute maximum stiffness and zero flex.",
    practicalDifferences: "The stiffest available — designed exclusively for racing gates at high speeds. Requires exceptional strength and technique.",
  },
  // Women's flexes
  65: {
    rating: 65,
    plasticsUsed: "Soft PU/polyolefin.",
    linerMaterials: "Soft, plush, and warm for maximum comfort.",
    bestFor: "Someone brand new to skiing who wants an easy-going, forgiving boot that feels warm and comfortable from the start.",
    practicalDifferences: "Very easy flex; perfect for building confidence.",
  },
  75: {
    rating: 75,
    plasticsUsed: "Slightly firmer PU.",
    linerMaterials: "Soft–medium with a warm, relaxed feel.",
    bestFor: "A progressing skier who wants a bit more support but still prioritises comfort and ease.",
    practicalDifferences: "Smooth, supportive feel without becoming demanding.",
  },
  85: {
    rating: 85,
    plasticsUsed: "PU with light reinforcement.",
    linerMaterials: "Moderately firm with supportive heel hold while remaining comfortable.",
    bestFor: "A lighter or developing intermediate skier who wants stability without feeling locked into a stiff boot.",
    practicalDifferences: "More precise control without feeling heavy or overpowering.",
  },
  95: {
    rating: 95,
    plasticsUsed: "PU with a stronger cuff.",
    linerMaterials: "Medium-firm and supportive with a secure feel.",
    bestFor: "A skier who's comfortable at speed and wants more edge hold and accuracy without sacrificing approachability.",
    practicalDifferences: "Stronger stability and more drive through the ski.",
  },
  105: {
    rating: 105,
    plasticsUsed: "Reinforced PU/Grilamid.",
    linerMaterials: "Dense, supportive performance liner suited to skiers who like a stronger, more connected feel.",
    bestFor: "A skier who drives their boots with strength and wants a controlled, precise feel without going into race-level stiffness.",
    practicalDifferences: "Strong energy transfer and a more purposeful, accurate ride.",
  },
  115: {
    rating: 115,
    plasticsUsed: "Very stiff reinforced PU/Grilamid.",
    linerMaterials: "Race-style liner with a firmer, cooler, minimal-padding fit built for precision.",
    bestFor: "A highly skilled skier who demands maximum control — carving hard, skiing steep terrain, or pushing the limits of performance.",
    practicalDifferences: "Very direct, powerful connection; ideal for strong and technically capable skiers.",
  },
  125: {
    rating: 125,
    plasticsUsed: "Race-grade reinforced PU/Grilamid with high torsional stiffness.",
    linerMaterials: "Firm, minimal-padding race liner designed for maximum precision and power.",
    bestFor: "Expert female skiers and competitors who need race-level stiffness and control.",
    practicalDifferences: "Extremely responsive and powerful — designed for aggressive, technical skiing at the highest level.",
  },
};

export default function FlexSelectionGuide({
  userAnswers,
  recommendedBoots,
  selectedModels,
}: FlexSelectionGuideProps) {
  const [expandedFlexes, setExpandedFlexes] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFlex = (flex: number) => {
    setExpandedFlexes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(flex)) {
        newSet.delete(flex);
      } else {
        newSet.add(flex);
      }
      return newSet;
    });
  };

  const isFlexExpanded = (flex: number) => {
    return expandedFlexes.has(flex);
  };

  // Close all sections if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setExpandedFlexes(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extract flex ratings from selected models only
  const selectedFlexes = new Set<number>();
  
  if (recommendedBoots && selectedModels) {
    recommendedBoots.forEach((boot) => {
      const selectedIndices = selectedModels[boot.bootId];
      if (selectedIndices && selectedIndices.size > 0 && boot.models) {
        // Add flex from selected models
        selectedIndices.forEach((index) => {
          if (boot.models && boot.models[index]) {
            selectedFlexes.add(boot.models[index].flex);
          }
        });
      } else {
        // If no models selected for this boot, include ALL available flex options
        if (boot.models && boot.models.length > 0) {
          // Add all flex values from all models
          boot.models.forEach((model) => {
            selectedFlexes.add(model.flex);
          });
        } else if (boot.flex) {
          // If boot has no models array, use base flex
          selectedFlexes.add(boot.flex);
        }
      }
    });
  } else if (recommendedBoots) {
    // If no selectedModels provided, include ALL flex options from all boots
    recommendedBoots.forEach((boot) => {
      if (boot.models && boot.models.length > 0) {
        // Add all flex values from all models
        boot.models.forEach((model) => {
          selectedFlexes.add(model.flex);
        });
      } else if (boot.flex) {
        // If boot has no models array, use base flex
        selectedFlexes.add(boot.flex);
      }
    });
  }
  
  // Convert to sorted array (descending - highest first)
  const flexesToShow = Array.from(selectedFlexes).sort((a, b) => b - a);
  
  // If no flexes from selected models, fall back to showing recommended range
  const acceptableFlexes = calculateAcceptableFlexRange(userAnswers);
  const flexRangeString = `${Math.min(...acceptableFlexes)}-${Math.max(...acceptableFlexes)}`;
  
  // Use selected flexes if available, otherwise show relevant flexes from recommended range
  const relevantFlexes = flexesToShow.length > 0 
    ? flexesToShow 
    : [60, 70, 80, 90, 95, 100, 110, 120, 130].filter(
        (flex) => flex >= Math.min(...acceptableFlexes) - 10 && flex <= Math.max(...acceptableFlexes) + 10
      ).sort((a, b) => b - a); // Sort descending (highest first)

  return (
    <div className="mt-10">
      <Card className="bg-[#2B2D30] border-[#F5E4D0]/20 shadow-lg">
        <CardContent className="pt-8 pb-8 px-6 md:px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#F4F4F4] mb-2">
              Help selecting the correct Flex
            </h3>
            <p className="text-sm text-[#F4F4F4]/70 leading-relaxed">
              Based on your profile ({userAnswers.ability} ability, {userAnswers.weightKG}kg, {userAnswers.gender.toLowerCase()}), 
              we recommend a flex range of <strong className="text-[#F5E4D0] font-semibold">{flexRangeString}</strong>.
            </p>
          </div>

          <div className="space-y-6">
            {relevantFlexes.map((flex) => {
              const info = flexInfoMap[flex];
              if (!info) return null;

              const isRecommended = acceptableFlexes.includes(flex);
              const flexNum = Number(flex);

              const isExpanded = isFlexExpanded(flex);

              return (
                <div
                  key={flex}
                  className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                    isRecommended
                      ? "border-[#F5E4D0]/40 bg-[#F5E4D0]/5 shadow-md"
                      : "border-[#F5E4D0]/20 bg-[#1A1C1E] hover:border-[#F5E4D0]/30"
                  }`}
                >
                  {/* Header button - Always visible */}
                  <button
                    onClick={() => toggleFlex(flex)}
                    className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-[#1A1C1E]/80 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 flex-1">
                      <h4 className="text-xl font-bold text-[#F5E4D0] flex-shrink-0">
                        {flex} Flex
                      </h4>
                      <p className="text-[#F4F4F4]/90 leading-relaxed text-[15px] flex-1">{info.bestFor}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#F5E4D0] flex-shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Expandable content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 space-y-2.5 border-t border-[#F5E4D0]/10 pt-5">
                      {/* Practical difference */}
                      <div>
                        <strong className="text-[#F5E4D0] font-semibold text-base block mb-1">
                          Practical difference
                        </strong>
                        <p className="text-[#F4F4F4]/90 leading-relaxed text-[15px]">
                          {info.practicalDifferences}
                        </p>
                      </div>

                      {/* Shell */}
                      <div className="pt-4 border-t border-[#F5E4D0]/10">
                        <strong className="text-[#F5E4D0] font-semibold text-base block mb-1">
                          Shell
                        </strong>
                        <p className="text-[#F4F4F4]/90 leading-relaxed text-[15px]">
                          {info.plasticsUsed}
                        </p>
                      </div>

                      {/* Liner */}
                      <div className="pt-4 border-t border-[#F5E4D0]/10">
                        <strong className="text-[#F5E4D0] font-semibold text-base block mb-1">
                          Liner
                        </strong>
                        <p className="text-[#F4F4F4]/90 leading-relaxed text-[15px]">
                          {info.linerMaterials}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

