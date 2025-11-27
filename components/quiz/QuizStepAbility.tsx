"use client";

import { useState, useEffect } from "react";
import { Ability } from "@/types";
import HelpModal from "./HelpModal";
import QuizStepLayout from "./QuizStepLayout";

interface Props {
  value?: Ability;
  onNext: (value: Ability) => void;
  onBack: () => void;
  onChange?: (value: Ability) => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function QuizStepAbility({
  value,
  onNext,
  onBack,
  onChange,
  currentStep,
  totalSteps,
}: Props) {
  const [selected, setSelected] = useState<Ability | undefined>(value);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (val: Ability) => {
    setSelected(val);
    onChange?.(val);
  };

  return (
    <QuizStepLayout
      title="Skiing Ability"
      description="Select an option that best matches your ability."
      currentStep={currentStep}
      totalSteps={totalSteps}
      helpContent={
        <>
        <button
          onClick={() => setShowCard(!showCard)}
            className="w-6 h-6 rounded-full border border-gray-300 hover:bg-gray-50 text-[#F4F4F4] inline-flex items-center justify-center font-semibold text-sm"
          title="Ability information"
        >
          ?
        </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Skiing Ability Levels"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-green-400 mb-1">Beginner</h4>
                  <p className="text-[#F4F4F4]/90 text-sm">New to skiing or still learning basic turns and stopping. Comfortable on green (easy) slopes.</p>
                </div>
      </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
            <div>
                  <h4 className="font-bold text-blue-400 mb-1">Intermediate</h4>
                  <p className="text-[#F4F4F4]/90 text-sm">Can confidently ski blue (intermediate) runs, make parallel turns, and control speed. Comfortable on most groomed terrain.</p>
            </div>
            </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
            <div>
                  <h4 className="font-bold text-red-400 mb-1">Advanced</h4>
                  <p className="text-[#F4F4F4]/90 text-sm">Skis black (difficult) runs with confidence, handles moguls and varied terrain. Strong technique and speed control.</p>
            </div>
          </div>
        </div>
          </HelpModal>
        </>
      }
      onBack={onBack}
      onNext={() => selected && onNext(selected)}
      isValid={!!selected}
    >
      <div className="space-y-3 lg:space-y-4 flex flex-col items-center max-w-md mx-auto">
        <button
          onClick={() => handleSelect("Beginner")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            selected === "Beginner"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Beginner</span>
        </button>
        <button
          onClick={() => handleSelect("Intermediate")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            selected === "Intermediate"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Intermediate</span>
        </button>
        <button
          onClick={() => handleSelect("Advanced")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            selected === "Advanced"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Advanced</span>
        </button>
      </div>
    </QuizStepLayout>
  );
}
