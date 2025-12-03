"use client";

import { useState, useEffect } from "react";
import { ToeShape } from "@/types";
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
      description="Select the image that best matches the shape of your toe shape."
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
            className="w-8 h-8 border-[3px] border-[#F5E4D0]/10 hover:bg-[#F5E4D0]/10 text-[#F4F4F4] inline-flex items-center justify-center font-bold text-lg"
            title="Toe box information"
          >
            ?
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Toe Box Shape Guide"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {toeShapes.map((shape) => (
                <div key={shape.value} className="border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 p-6 flex flex-col">
                  <img
                    src={`/quiz/${shape.label}.svg`}
                    alt={`${shape.label} toe box`}
                    className="w-full max-w-[350px] h-auto max-h-72 object-contain mx-auto mb-0"
                  />
                  <div className="flex justify-center">
                    <p className="text-base text-[#F4F4F4]/90 text-left max-w-[300px]">
                      <span className="font-bold text-[#F5E4D0]">{shape.label}:</span>{" "}
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
      <div className="flex flex-row items-center justify-start gap-6 max-w-2xl flex-wrap">
        {toeShapes.map((shape) => (
          <div key={shape.value} className="flex items-center gap-3 group">
            <span
              onClick={() => {
                const index = toeShapes.findIndex((s) => s.value === shape.value);
                if (index >= 0) {
                  handleSliderChange(index);
                }
              }}
              className={`text-lg font-medium cursor-pointer transition-colors ${
                selected === shape.value ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
              }`}
            >
              {shape.label}
            </span>
            <input
              type="checkbox"
              checked={selected === shape.value}
              onChange={() => {
                const index = toeShapes.findIndex((s) => s.value === shape.value);
                if (index >= 0) {
                  handleSliderChange(index);
                }
              }}
              className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
            />
          </div>
        ))}
      </div>
    </QuizStepLayout>
  );
}
