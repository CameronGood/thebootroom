"use client";

import { useState } from "react";
import { QuizAnswers } from "@/types";
import HelpModal from "./HelpModal";
import QuizStepLayout from "./QuizStepLayout";

interface Props {
  footLengthMM?: { left: number; right: number };
  shoeSize?: { system: "UK" | "US" | "EU"; value: number };
  onNext: (value: {
    footLengthMM?: { left: number; right: number };
    shoeSize?: { system: "UK" | "US" | "EU"; value: number };
  }) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function QuizStepFootLength({
  footLengthMM,
  shoeSize,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: Props) {
  const [inputType, setInputType] = useState<"mm" | "shoe">(
    footLengthMM ? "mm" : shoeSize ? "shoe" : "mm"
  );
  const [leftMM, setLeftMM] = useState(footLengthMM?.left?.toString() || "");
  const [rightMM, setRightMM] = useState(footLengthMM?.right?.toString() || "");
  const [shoeSystem, setShoeSystem] = useState<"UK" | "US" | "EU">(
    shoeSize?.system || "UK"
  );
  const [shoeValue, setShoeValue] = useState(shoeSize?.value?.toString() || "");
  const [showCard, setShowCard] = useState(false);

  const handleSubmit = () => {
    if (inputType === "mm") {
      const left = parseFloat(leftMM);
      const right = parseFloat(rightMM);
      if (left > 0 && right > 0) {
        // Only send mm values, explicitly clear shoe size
        onNext({ footLengthMM: { left, right }, shoeSize: undefined });
      }
    } else {
      const value = parseFloat(shoeValue);
      if (value > 0) {
        // Only send shoe size, explicitly clear mm values
        onNext({ shoeSize: { system: shoeSystem, value }, footLengthMM: undefined });
      }
    }
  };

  const isValid =
    inputType === "mm"
      ? leftMM && rightMM && parseFloat(leftMM) > 0 && parseFloat(rightMM) > 0
      : shoeValue && shoeValue !== "" && parseFloat(shoeValue) > 0;

  return (
    <QuizStepLayout
      title="Foot Length"
      description="Measure each foot from heel to longest toe."
      currentStep={currentStep}
      totalSteps={totalSteps}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="w-6 h-6 rounded-full border border-gray-300 hover:bg-gray-50 text-[#F4F4F4] inline-flex items-center justify-center font-semibold text-sm"
            title="How to measure"
          >
            ?
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="How to Measure Foot Length"
          >
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <img
                  src="/quiz/Foot Length.svg"
                  alt="How to measure foot length"
                  className="max-w-xs h-auto max-h-48 object-contain rounded-lg border border-[#F5E4D0]/20"
                />
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-400 text-lg">💡</span>
                  <span className="font-semibold text-amber-400">Pro Tip</span>
                </div>
                <p className="text-sm text-[#F4F4F4]/90">For Performance fit measure without socks. For comfort fit measure with socks.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-[#F4F4F4]/90">Place a sheet of paper on the floor so the edge is touching the book or cereal box.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-[#F4F4F4]/90">Stand on the sheet of paper with your heel against the book or cereal box.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <p className="text-[#F4F4F4]/90">Use a pen to draw a line just in front of your longest toe. Repeat for both feet.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <p className="text-[#F4F4F4]/90">Using a ruler, measure the distance between the start of the paper and line.</p>
        </div>
              </div>
            </div>
          </HelpModal>
        </>
      }
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
    >
      <div className="flex flex-col items-center max-w-lg mx-auto space-y-2">
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={() => {
              setInputType("mm");
              setShoeSystem("UK");
              setShoeValue("");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              inputType === "mm"
                ? "bg-[#F5E4D0] text-[#2B2D30]"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            My feet
          </button>
          <button
            onClick={() => {
              setInputType("shoe");
              setLeftMM("");
              setRightMM("");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              inputType === "shoe"
                ? "bg-[#F5E4D0] text-[#2B2D30]"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Quick
          </button>
        </div>

        {inputType === "mm" ? (
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <div className="relative">
              <input
                id="leftFootMM"
                name="leftFootMM"
                type="number"
                value={leftMM}
                onChange={(e) => setLeftMM(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg bg-transparent text-[#F4F4F4] text-lg font-semibold focus:outline-none focus:border-[#F5E4D0] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] p-4 pr-12"
                placeholder="Left 268"
                min="100"
                max="400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F4F4F4] pointer-events-none font-semibold">mm</span>
            </div>
            <div className="relative">
              <input
                id="rightFootMM"
                name="rightFootMM"
                type="number"
                value={rightMM}
                onChange={(e) => setRightMM(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg bg-transparent text-[#F4F4F4] text-lg font-semibold focus:outline-none focus:border-[#F5E4D0] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] p-4 pr-12"
                placeholder="Right 265"
                min="100"
                max="400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F4F4F4] pointer-events-none font-semibold">mm</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full max-w-sm">
              <select
                id="shoeSystem"
                name="shoeSystem"
                value={shoeSystem}
              onChange={(e) => setShoeSystem(e.target.value as "UK" | "US" | "EU")}
              className="w-full border-2 border-gray-300 rounded-lg appearance-none bg-transparent text-[#F4F4F4] text-lg font-semibold bg-no-repeat bg-right bg-[length:20px] focus:outline-none focus:border-[#F5E4D0] p-4 pr-12"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F4F4F4' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 1.5rem center',
                }}
              >
                <option value="UK" className="bg-[#2B2D30] text-[#F4F4F4]">UK</option>
                <option value="US" className="bg-[#2B2D30] text-[#F4F4F4]">US</option>
                <option value="EU" className="bg-[#2B2D30] text-[#F4F4F4]">EU</option>
              </select>
              <select
                id="shoeSize"
                name="shoeSize"
                value={shoeValue}
                onChange={(e) => setShoeValue(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg appearance-none bg-transparent text-[#F4F4F4] text-lg font-semibold bg-no-repeat bg-right bg-[length:20px] focus:outline-none focus:border-[#F5E4D0] p-4 pr-12"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F4F4F4' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 1.5rem center',
                }}
              >
                <option value="" className="bg-[#2B2D30] text-[#F4F4F4]">Select size</option>
                {Array.from({ length: 17 }, (_, i) => {
                  const size = 4 + i * 0.5;
                  return (
                    <option key={size} value={size} className="bg-[#2B2D30] text-[#F4F4F4]">
                      {size}
                    </option>
                  );
                })}
              </select>
          </div>
        )}
      </div>
    </QuizStepLayout>
  );
}
