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
      helpContent={
        <>
        <button
          onClick={() => setShowCard(!showCard)}
            className="w-6 h-6 rounded-full border border-gray-300 hover:bg-gray-50 text-[#F4F4F4] inline-flex items-center justify-center font-semibold text-sm"
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
      <div className="space-y-3 lg:space-y-4 flex flex-col items-center max-w-md mx-auto">
        <button
          onClick={() => handleSelect("Male")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            selected === "Male"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Male</span>
        </button>
        <button
          onClick={() => handleSelect("Female")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            selected === "Female"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Female</span>
        </button>
      </div>
    </QuizStepLayout>
  );
}
