"use client";

import { useState, useEffect } from "react";
import { Gender } from "@/types";
import HelpModal from "./HelpModal";
import QuizOptionButton from "./QuizOptionButton";
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
      description="Select the anatomy that matches your foot and lower leg."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      helpContent={
        <>
        <button
          onClick={() => setShowCard(!showCard)}
          className="w-8 h-8 border border-[#F5E4D0]/10 bg-[#F4F4F4] hover:bg-[#E8D4B8] text-[#2B2D30] inline-flex items-center justify-center font-bold text-lg rounded-[4px] transition-colors"
          title="Anatomy information"
        >
          ?
        </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Anatomy Information"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-[#F5E4D0]/10 p-4 flex-1">
                <h4 className="font-bold text-[#F5E4D0] mb-2">Male Anatomy</h4>
                <p className="text-[#F4F4F4]/90">Typically features a wider forefoot, higher instep, and larger calf volume. Boots designed for male anatomy accommodate these proportions for optimal fit and performance.</p>
      </div>
              <div className="bg-[#F5E4D0]/10 p-4 flex-1">
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
      <div className="flex flex-row items-center justify-start gap-3 max-w-2xl flex-wrap">
        <QuizOptionButton active={selected === "Male"} onClick={() => handleSelect("Male")}>
          Male
        </QuizOptionButton>
        <QuizOptionButton active={selected === "Female"} onClick={() => handleSelect("Female")}>
          Female
        </QuizOptionButton>
      </div>
    </QuizStepLayout>
  );
}
