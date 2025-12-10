"use client";

import { FittingBreakdown, QuizAnswers, BootSummary } from "@/types";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import BootComparisonTable from "@/components/BootComparisonTable";
import FlexSelectionGuide from "@/components/FlexSelectionGuide";
import FittingAdviceGuide from "@/components/FittingAdviceGuide";

interface BreakdownDisplayProps {
  breakdown: FittingBreakdown | null;
  loading: boolean;
  generating: boolean;
  error?: boolean;
  sessionBoots?: Array<{ bootId: string; brand: string; model: string }>;
  userAnswers?: QuizAnswers;
  recommendedBoots?: BootSummary[];
  selectedModels?: Record<string, Set<number>>;
}


export default function BreakdownDisplay({
  breakdown,
  loading,
  generating,
  error = false,
  sessionBoots = [],
  userAnswers,
  recommendedBoots,
  selectedModels,
}: BreakdownDisplayProps) {

  if (loading || generating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 mb-6"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#F5E4D0]" />
              <span className="text-[#F4F4F4]">
                {generating ? "Generating your breakdown..." : "Loading breakdown..."}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show error message if there's an error, or if we expected a breakdown but it's missing/empty
  // Only show error if we've attempted to load/generate (not on initial page load)
  if (error || (breakdown && (!breakdown.sections || breakdown.sections.length === 0))) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 mb-8"
      >
        <Card className="bg-[#2B2D30] border-[#F5E4D0]/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <p className="text-[#F4F4F4] text-lg">
                Breakdown Unavailable at this time
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Don't show anything if breakdown hasn't been requested/generated yet
  // (unless we're loading or generating, which shows a loading state)
  if (!breakdown && !loading && !generating) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-0 space-y-8"
    >
       {/* Boot-to-Boot Comparison Table */}
       {breakdown && userAnswers && recommendedBoots && recommendedBoots.length > 0 && (
         <BootComparisonTable
           boots={recommendedBoots}
           userAnswers={userAnswers}
           selectedModels={selectedModels}
         />
       )}

       {/* Flex Selection Guide */}
      {breakdown && userAnswers && (
        <FlexSelectionGuide 
          userAnswers={userAnswers} 
          recommendedBoots={recommendedBoots}
          selectedModels={selectedModels}
        />
      )}

       {/* Fitting Advice Guide */}
       {breakdown && <FittingAdviceGuide />}
    </motion.div>
  );
}
