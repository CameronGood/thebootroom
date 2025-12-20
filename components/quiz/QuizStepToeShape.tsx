"use client";

import { useState, useEffect } from "react";
import { ToeShape } from "@/types";
import QuizOptionButton from "./QuizOptionButton";
import QuizStepLayout from "./QuizStepLayout";
import HelpModal from "./HelpModal";

interface Props {
  value?: ToeShape;
  onNext: (value: ToeShape) => void;
  onBack: () => void;
  onChange?: (value: ToeShape) => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function QuizStepToeShape({
  value,
  onNext,
  onBack,
  onChange,
  currentStep,
  totalSteps,
}: Props) {
  const toeShapes: { value: ToeShape; label: string }[] = [
    { value: "Round", label: "Round" },
    { value: "Square", label: "Square" },
    { value: "Angled", label: "Angled" },
  ];

  // Find initial slider value based on current value
  const getInitialSliderValue = (): number => {
    if (!value) return 0;
    const index = toeShapes.findIndex((shape) => shape.value === value);
    return index >= 0 ? index : 0;
  };

  const [sliderValue, setSliderValue] = useState<number>(getInitialSliderValue());
  const [selected, setSelected] = useState<ToeShape | undefined>(value);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (value) {
      const index = toeShapes.findIndex((shape) => shape.value === value);
      if (index >= 0) {
        setSliderValue(index);
        setSelected(value);
      }
    }
  }, [value]);

  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);
    const selectedShape = toeShapes[newValue];
    setSelected(selectedShape.value);
    onChange?.(selectedShape.value);
  };

  const handleSubmit = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <QuizStepLayout
      title="Toe Box"
      description="Select the option that best matches the shape of your toe box."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onNext={handleSubmit}
      isValid={!!selected}
      brutalistMode={true}
      noContentSpacing={true}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="text-[#F5E4D0] font-bold uppercase text-sm underline hover:text-[#E8D4B8] transition-colors cursor-pointer"
            title="Toe box information"
          >
            MORE INFO
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Toe Box Shape Guide"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {toeShapes.map((shape) => (
                <div key={shape.value} className="border border-[#F5E4D0]/10 bg-[#2B2D30]/30 p-2 md:p-3 flex flex-col rounded-[4px]">
                  <img
                    src={`/feet/${shape.label}-01-01.svg`}
                    alt={`${shape.label} toe box`}
                    className="w-full h-auto max-h-[30vh] md:max-h-[32vh] object-contain mx-auto mb-2"
                  />
                  <div className="flex justify-center">
                    <p className="text-base text-[#F4F4F4]/90 text-left max-w-[300px] leading-relaxed">
                      <span className="font-bold text-[#F5E4D0] text-base md:text-lg">{shape.label}:</span>{" "}
                      {shape.value === "Round" && "A curved, rounded shape at the front of the toe box."}
                      {shape.value === "Square" && "A straight, box-like shape with sharp corners."}
                      {shape.value === "Angled" && "A diagonal or slanted shape, typically pointing outward."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </HelpModal>
        </>
      }
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 max-w-2xl">
        {toeShapes.map((shape, index) => (
          <QuizOptionButton
              key={shape.value}
            active={selected === shape.value}
            onClick={() => handleSliderChange(index)}
            >
              {shape.label}
          </QuizOptionButton>
        ))}
      </div>
    </QuizStepLayout>
  );
}
