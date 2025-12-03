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
  const currentStepRef = useRef<HTMLDivElement | null>(null);

  // Scroll current step into view and center it when it changes
  useEffect(() => {
    if (currentStepRef.current) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        currentStepRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 100);
    }
  }, [currentStep]);

  const isStepCompleted = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return !!answers.gender;
      case 2:
        return !!answers.bootType;
      case 3:
        return !!answers.ability;
      case 4:
        return !!answers.weightKG;
      case 5:
        return !!(answers.footLengthMM || answers.shoeSize);
      case 6:
        return !!answers.footWidth;
      case 7:
        return !!answers.toeShape;
      case 8:
        return !!answers.instepHeight;
      case 9:
        return !!answers.ankleVolume;
      case 10:
        return !!answers.calfVolume;
      default:
        return false;
    }
  };

  const getStepTitle = (stepNum: number): string => {
    switch (stepNum) {
      case 1:
        return "ANATOMY";
      case 2:
        return "BOOT TYPE";
      case 3:
        return "ABILITY";
      case 4:
        return "WEIGHT";
      case 5:
        return "FOOT LENGTH";
      case 6:
        return "FOOT WIDTH";
      case 7:
        return "TOE SHAPE";
      case 8:
        return "INSTEP HEIGHT";
      case 9:
        return "ANKLE VOLUME";
      case 10:
        return "CALF VOLUME";
      default:
        return "";
    }
  };

  const renderStep = (stepNum: number) => {
    const completed = isStepCompleted(stepNum);
    
    if (stepNum === currentStep) {
      // Current step - expanded
      const step = steps.find((s) => s.stepNumber === stepNum);
      if (!step) return null;
      return (
        <div
          key={stepNum}
          ref={currentStepRef}
          className="border-[4px] border-[#F5E4D0]/10 bg-[#2B2D30]/50 p-0"
        >
          {step.component}
        </div>
      );
    } else if (completed) {
      // Completed step - collapsed with checkmark (clickable)
      return (
        <div
          key={stepNum}
          onClick={() => onStepClick?.(stepNum)}
          className="border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-6 py-4 cursor-pointer transition-all hover:bg-[#2B2D30]/70 hover:border-[#F5E4D0]/20"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold uppercase text-[#F4F4F4]">
              {getStepTitle(stepNum)}
            </h3>
            <Check className="w-6 h-6 text-[#F5E4D0] flex-shrink-0" />
          </div>
        </div>
      );
    } else if (stepNum === currentStep + 1) {
      // Next step - heading only (if not completed)
      return (
        <div
          key={stepNum}
          className="border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-6 py-4"
        >
          <h3 className="text-xl font-bold uppercase text-[#F4F4F4]/60">
            {getStepTitle(stepNum)}
          </h3>
        </div>
      );
    } else {
      // Future incomplete steps - hidden
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#040404] pt-[132px] pb-8">
      <div className="w-[90%] mx-auto max-w-6xl space-y-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) =>
          renderStep(stepNum)
        )}
      </div>
    </div>
  );
}

