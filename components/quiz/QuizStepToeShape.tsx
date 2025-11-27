"use client";

import { useState, useEffect } from "react";
import { ToeShape } from "@/types";
import QuizStepLayout from "./QuizStepLayout";

interface Props {
  value?: ToeShape;
  onNext: (value: ToeShape) => void;
  onBack: () => void;
  onChange?: (value: ToeShape) => void;
  currentStep?: number;
  totalSteps?: number;
}

// Helper function to get image path - supports SVG and other formats
const getImagePath = (shape: string): string => {
  const basePath = "/quiz/";
  const lowerShape = shape.toLowerCase();
  // Try SVG first, then fallback to other formats
  return `${basePath}${lowerShape}.svg`;
};

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

  const currentShape = toeShapes[sliderValue];

  return (
    <QuizStepLayout
      title="Toe Box"
      description="Select the image that best matches the shape of your toe shape."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onNext={() => selected && onNext(selected)}
      isValid={!!selected}
      noContentSpacing={true}
    >
      <div className="flex flex-col items-center space-y-3 lg:space-y-4 max-w-2xl mx-auto">
        {/* Image display */}
        <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-transparent rounded-lg flex items-center justify-center overflow-hidden max-h-[45vh] md:-mt-[40px]">
          <img
            src={getImagePath(currentShape.value)}
            alt={currentShape.label}
            className="w-full h-full object-contain"
            style={{ filter: 'saturate(0.75)' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent && !parent.querySelector(".emoji-fallback")) {
                const emojiMap: Record<ToeShape, string> = {
                  Round: "🔵",
                  Square: "⬜",
                  Angled: "🔺",
                };
                const fallback = document.createElement("span");
                fallback.className = "emoji-fallback text-4xl";
                fallback.textContent = emojiMap[currentShape.value];
                parent.appendChild(fallback);
              }
            }}
          />
            </div>

        {/* Slider */}
        <div className="w-full max-w-md md:-mt-[40px]">
          <style dangerouslySetInnerHTML={{__html: `
            .toe-box-slider::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              background: #F5E4D0;
              border-radius: 4px;
              cursor: pointer;
            }
            .toe-box-slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              background: #F5E4D0;
              border-radius: 4px;
              cursor: pointer;
              border: none;
            }
          `}} />
          <input
            type="range"
            min="0"
            max={toeShapes.length - 1}
            step="1"
            value={sliderValue}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className="toe-box-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F5E4D0]"
            style={{
              background: `linear-gradient(to right, #F5E4D0 0%, #F5E4D0 ${(sliderValue / (toeShapes.length - 1)) * 100}%, rgba(229, 231, 235, 0.7) ${(sliderValue / (toeShapes.length - 1)) * 100}%, rgba(229, 231, 235, 0.7) 100%)`
            }}
          />
           <div className="flex justify-between mt-2 text-sm sm:text-base text-[#F4F4F4]">
            {toeShapes.map((shape, index) => (
              <span key={shape.value} className={index === sliderValue ? "font-semibold text-[#F5E4D0]" : ""}>
                {shape.label}
              </span>
            ))}
            </div>
          </div>
      </div>
    </QuizStepLayout>
  );
}
