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
      title="Ability"
      description="Select an option that best matches your ability."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      helpContent={
        <>
        <button
          onClick={() => setShowCard(!showCard)}
            className="w-8 h-8 border-[3px] border-[#F5E4D0]/10 hover:bg-[#F5E4D0]/10 text-[#F4F4F4] inline-flex items-center justify-center font-bold text-lg"
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
      <div className="flex flex-row items-center justify-start gap-4 max-w-2xl flex-wrap">
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
            onClick={() => handleSelect("Beginner")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              selected === "Beginner" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
            }`}
          >
            Beginner
          </span>
          <input
            type="checkbox"
            checked={selected === "Beginner"}
            onChange={() => handleSelect("Beginner")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
            onClick={() => handleSelect("Intermediate")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              selected === "Intermediate" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
            }`}
          >
            Intermediate
          </span>
          <input
            type="checkbox"
            checked={selected === "Intermediate"}
            onChange={() => handleSelect("Intermediate")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
            onClick={() => handleSelect("Advanced")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              selected === "Advanced" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
            }`}
          >
            Advanced
          </span>
          <input
            type="checkbox"
            checked={selected === "Advanced"}
            onChange={() => handleSelect("Advanced")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
      </div>
    </QuizStepLayout>
  );
}
