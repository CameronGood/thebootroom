"use client";

import { useState, useEffect } from "react";
import { Ability } from "@/types";
import HelpModal from "./HelpModal";
import QuizOptionButton from "./QuizOptionButton";
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
      title="Ability"
      description="Select the option that matches your ability."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      helpContent={
        <>
        <button
          onClick={() => setShowCard(!showCard)}
            className="text-[#F5E4D0] font-bold uppercase text-sm underline hover:text-[#E8D4B8] transition-colors cursor-pointer"
          title="Ability information"
        >
          MORE INFO
        </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Skiing Ability Levels"
          >
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 flex-1">
                <div className="w-3 h-3 bg-green-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-green-400 mb-1 text-base md:text-lg">Beginner</h4>
                  <p className="text-[#F4F4F4]/90 text-base">New to skiing or still learning basic turns and stopping. Comfortable on green (easy) slopes.</p>
                </div>
      </div>
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 flex-1">
                <div className="w-3 h-3 bg-blue-500 mt-1.5 flex-shrink-0"></div>
            <div>
                  <h4 className="font-bold text-blue-400 mb-1 text-base md:text-lg">Intermediate</h4>
                  <p className="text-[#F4F4F4]/90 text-base">Can confidently ski blue (intermediate) runs, make parallel turns, and control speed. Comfortable on most groomed terrain.</p>
            </div>
            </div>
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 flex-1">
                <div className="w-3 h-3 bg-red-500 mt-1.5 flex-shrink-0"></div>
            <div>
                  <h4 className="font-bold text-red-400 mb-1 text-base md:text-lg">Advanced</h4>
                  <p className="text-[#F4F4F4]/90 text-base">Skis black (difficult) runs with confidence, handles moguls and varied terrain. Strong technique and speed control.</p>
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 max-w-2xl">
        <QuizOptionButton active={selected === "Beginner"} onClick={() => handleSelect("Beginner")}>
          Beginner
        </QuizOptionButton>
        <QuizOptionButton active={selected === "Intermediate"} onClick={() => handleSelect("Intermediate")}>
          Intermediate
        </QuizOptionButton>
        <QuizOptionButton active={selected === "Advanced"} onClick={() => handleSelect("Advanced")}>
          Advanced
        </QuizOptionButton>
      </div>
    </QuizStepLayout>
  );
}
