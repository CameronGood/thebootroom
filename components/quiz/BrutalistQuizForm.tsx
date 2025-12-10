"use client";

import { ReactNode, useRef, useEffect } from "react";
import { QuizAnswers } from "@/types";
import { Check } from "lucide-react";

interface StepConfig {
  stepNumber: number;
  title: string;
  description: string;
  component: ReactNode;
  isCompleted: boolean;
}

interface BrutalistQuizFormProps {
  currentStep: number;
  totalSteps: number;
  answers: Partial<QuizAnswers>;
  steps: StepConfig[];
  onStepClick?: (stepNumber: number) => void;
}

export default function BrutalistQuizForm({
  currentStep,
  totalSteps,
  answers,
  steps,
  onStepClick,
}: BrutalistQuizFormProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentStepRef = useRef<HTMLDivElement | null>(null);

  // Scroll to show current step at 120px from top (below nav)
  useEffect(() => {
    if (currentStepRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const stepElement = currentStepRef.current;
      
      // Calculate position to place element at 120px from top of viewport
      const containerRect = container.getBoundingClientRect();
      const elementRect = stepElement.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const navOffset = 120; // Position 120px from top
      const targetScrollTop = scrollTop + elementRect.top - containerRect.top - navOffset;
      
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  const isStepCompleted = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1: return !!answers.gender;
      case 2: return !!answers.bootType;
      case 3: return !!answers.ability;
      case 4: return !!answers.weightKG;
      case 5: return !!(answers.footLengthMM || answers.shoeSize);
      case 6: return !!answers.footWidth;
      case 7: return !!answers.toeShape;
      case 8: return !!answers.instepHeight;
      case 9: return !!answers.ankleVolume;
      case 10: return !!answers.calfVolume;
      default: return false;
    }
  };

  const getStepTitle = (stepNum: number): string => {
    const titles: Record<number, string> = {
      1: "ANATOMY", 2: "BOOT TYPE", 3: "ABILITY", 4: "WEIGHT",
      5: "FOOT LENGTH", 6: "FOOT WIDTH", 7: "TOE SHAPE",
      8: "INSTEP HEIGHT", 9: "ANKLE VOLUME", 10: "CALF VOLUME"
    };
    return titles[stepNum] || "";
  };

  // Sort steps: current first, then incomplete future steps, then completed steps
  const sortedSteps = Array.from({ length: totalSteps }, (_, i) => i + 1).sort((a, b) => {
    const aCompleted = isStepCompleted(a);
    const bCompleted = isStepCompleted(b);
    const aCurrent = a === currentStep;
    const bCurrent = b === currentStep;

    // Current step always first
    if (aCurrent) return -1;
    if (bCurrent) return 1;

    // Completed steps go to bottom
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;

    // For steps in the same category, maintain original order
    return a - b;
  });

  return (
    <div className="bg-[#040404] min-h-screen relative">
      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="relative min-h-screen overflow-y-auto z-[90]"
        style={{ 
          paddingTop: '120px',
          paddingBottom: '120px',
        }}
      >
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="flex flex-col" style={{ gap: '5px' }}>
            {/* Render steps in sorted order */}
            {sortedSteps.map((stepNum) => {
              const completed = isStepCompleted(stepNum);
              const isCurrent = stepNum === currentStep;
              const step = steps[stepNum - 1];

              return (
                <div
                  key={`step-${stepNum}`}
                  ref={isCurrent ? currentStepRef : undefined}
                  className="w-full"
                  style={{
                    scrollSnapAlign: isCurrent ? 'center' : 'none',
                    marginBottom: 0,
                    marginTop: 0,
                  }}
                >
                  {isCurrent && step ? (
                    // Current step: render full component
                    <div className="w-full">
                      {step.component}
                    </div>
                  ) : completed ? (
                    // Completed step: collapsed heading with checkmark
                    <div
                      onClick={() => {
                        if (onStepClick) {
                          onStepClick(stepNum);
                        }
                      }}
                      className="w-full border border-[#F5E4D0]/20 bg-[#2B2D30]/70 px-6 py-4 cursor-pointer hover:bg-[#2B2D30]/90 hover:border-[#F5E4D0]/20 rounded-[8px] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold uppercase text-[#F4F4F4]">
                          {getStepTitle(stepNum)}
                        </h3>
                        <Check className="w-6 h-6 text-[#F4F4F4] flex-shrink-0" />
                      </div>
                    </div>
                  ) : (
                    // Future step: collapsed heading only
                    <div className="w-full border border-[#F5E4D0]/20 bg-[#2B2D30]/70 px-6 py-4 rounded-[8px]">
                      <h3 className="text-xl font-bold uppercase text-[#040404]">
                        {getStepTitle(stepNum)}
                      </h3>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
