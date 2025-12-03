"use client";

import { useState, useEffect } from "react";
import { Gender } from "@/types";
import HelpModal from "./HelpModal";
import QuizStepLayout from "./QuizStepLayout";

interface Props {
  value?: Gender;
  onNext: (value: Gender) => void;
  onChange?: (value: Gender) => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function QuizStepGender({ value, onNext, onChange, currentStep, totalSteps }: Props) {
  const [selected, setSelected] = useState<Gender | undefined>(value);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (val: Gender) => {
    setSelected(val);
    onChange?.(val);
  };

  return (
    <QuizStepLayout
      title="Anatomy"
      description="Select the anatomy that best matches your lower leg and foot shape."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      helpContent={
        <>
        <button
          onClick={() => setShowCard(!showCard)}
            className="w-8 h-8 border-[3px] border-[#F5E4D0]/10 hover:bg-[#F5E4D0]/10 text-[#F4F4F4] inline-flex items-center justify-center font-bold text-lg"
          title="Anatomy information"
        >
          ?
        </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Anatomy Information"
          >
            <div className="space-y-4">
              <div className="bg-[#F5E4D0]/10 rounded-lg p-4 border-l-4 border-[#F5E4D0]">
                <h4 className="font-bold text-[#F5E4D0] mb-2">Male Anatomy</h4>
                <p className="text-[#F4F4F4]/90">Typically features a wider forefoot, higher instep, and larger calf volume. Boots designed for male anatomy accommodate these proportions for optimal fit and performance.</p>
      </div>
              <div className="bg-[#F5E4D0]/10 rounded-lg p-4 border-l-4 border-[#F5E4D0]">
                <h4 className="font-bold text-[#F5E4D0] mb-2">Female Anatomy</h4>
                <p className="text-[#F4F4F4]/90">Generally has a narrower heel, lower calf height and smaller calf volume. Female-specific boots are designed to fit these anatomical differences for better comfort and performance.</p>
            </div>
            </div>
          </HelpModal>
        </>
      }
      onNext={() => selected && onNext(selected)}
      isValid={!!selected}
      showBackButton={false}
    >
      <div className="flex flex-row items-center justify-start gap-4 max-w-2xl flex-wrap">
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
          onClick={() => handleSelect("Male")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              selected === "Male" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
            }`}
          >
            Male
          </span>
          <input
            type="checkbox"
            checked={selected === "Male"}
            onChange={() => handleSelect("Male")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
          onClick={() => handleSelect("Female")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              selected === "Female" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
          }`}
        >
            Female
          </span>
          <input
            type="checkbox"
            checked={selected === "Female"}
            onChange={() => handleSelect("Female")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
      </div>
    </QuizStepLayout>
  );
}
