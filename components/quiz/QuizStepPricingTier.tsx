"use client";

import QuizStepLayout from "./QuizStepLayout";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Props {
  value?: 'free' | 'paid';
  onNext: (value: 'free' | 'paid') => void;
  onBack: () => void;
  onChange?: (value: 'free' | 'paid') => void;
  currentStep?: number;
  totalSteps?: number;
  sessionId: string;
  userId?: string;
  onPurchaseClick?: () => void;
  isCreatingPayment?: boolean;
}

export default function QuizStepPricingTier({
  value,
  onNext,
  onBack,
  onChange,
  currentStep,
  totalSteps,
  sessionId,
  userId,
  onPurchaseClick,
  isCreatingPayment = false,
}: Props) {

  return (
    <QuizStepLayout
      title="Results"
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      noContentSpacing={true}
    >
        <div className="w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <div className="relative border-2 rounded-lg p-6 border-[#F5E4D0]/20 bg-[#2B2D30]/30 flex flex-col">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-[#F4F4F4] mb-2">RESULTS</h3>
                <p className="text-3xl font-bold text-[#F5E4D0]">FREE</p>
              </div>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#F5E4D0] mt-0.5 flex-shrink-0" />
                  <p className="text-[#F4F4F4]/90">Best 3 models and brands for your feet</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#F5E4D0] mt-0.5 flex-shrink-0" />
                  <p className="text-[#F4F4F4]/90">Recommended Ski Boot Size</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#F5E4D0] mt-0.5 flex-shrink-0" />
                  <p className="text-[#F4F4F4]/90">Purchase from trusted bootfitters</p>
                </div>
              </div>

              <Button
                onClick={() => onNext('free')}
                className="w-full bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] font-bold py-3 mt-auto"
              >
                GET RESULTS
              </Button>
            </div>

            {/* Paid Tier */}
            <div className="relative border-2 rounded-lg p-6 border-[#F5E4D0]/20 bg-[#2B2D30]/30 flex flex-col">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-[#F4F4F4] mb-2">RESULTS + COMPARISON</h3>
                <p className="text-3xl font-bold text-[#F5E4D0]">£2.99</p>
              </div>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#F5E4D0] mt-0.5 flex-shrink-0" />
                  <p className="text-[#F4F4F4]/90">Everything included in Free</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#F5E4D0] mt-0.5 flex-shrink-0" />
                  <p className="text-[#F4F4F4]/90">Personalised breakdown of each model</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#F5E4D0] mt-0.5 flex-shrink-0" />
                  <p className="text-[#F4F4F4]/90">Boot-to-Boot comparison</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#F5E4D0] mt-0.5 flex-shrink-0" />
                  <p className="text-[#F4F4F4]/90">Help selecting the correct flex and model.</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  onPurchaseClick?.();
                }}
                disabled={isCreatingPayment}
                className="w-full bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] font-bold py-3 mt-auto"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Payment...
                  </>
                ) : (
                  "BUY NOW"
                )}
              </Button>
            </div>
          </div>
        </div>
      </QuizStepLayout>
  );
}

