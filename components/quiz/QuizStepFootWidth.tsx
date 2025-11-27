"use client";

import { useState } from "react";
import { QuizAnswers } from "@/types";
import HelpModal from "./HelpModal";
import QuizStepLayout from "./QuizStepLayout";

interface Props {
  footWidth?: QuizAnswers["footWidth"];
  onNext: (value: QuizAnswers["footWidth"]) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

function QuizStepFootWidth({
  footWidth,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: Props) {
  const [inputType, setInputType] = useState<"mm" | "category">(
    "left" in (footWidth || {})
      ? "mm"
      : "category" in (footWidth || {})
        ? "category"
        : "mm"
  );
  const [leftMM, setLeftMM] = useState(
    "left" in (footWidth || {}) ? footWidth?.left?.toString() || "" : ""
  );
  const [rightMM, setRightMM] = useState(
    "left" in (footWidth || {}) ? footWidth?.right?.toString() || "" : ""
  );
  const [category, setCategory] = useState<"Narrow" | "Average" | "Wide">(
    "category" in (footWidth || {})
      ? footWidth?.category || "Average"
      : "Average"
  );
  const [showCard, setShowCard] = useState(false);

  const handleSubmit = () => {
    if (inputType === "mm") {
      const left = leftMM ? parseFloat(leftMM) : undefined;
      const right = rightMM ? parseFloat(rightMM) : undefined;
      if (left || right) {
        // Only send mm values, explicitly exclude category
        onNext({ left, right });
      }
    } else {
      // Only send category, explicitly exclude mm values
      onNext({ category });
    }
  };

  const isValid =
    inputType === "mm"
      ? (leftMM && parseFloat(leftMM) > 0) ||
        (rightMM && parseFloat(rightMM) > 0)
      : true;

  return (
    <QuizStepLayout
      title="Foot Width"
      description="Measure across the widest part of each foot."
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
            title="How to Measure Foot Width"
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-[#F4F4F4]/90">Stand on a flat surface with your weight evenly distributed</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-[#F4F4F4]/90">Find the widest part of your foot (usually across the ball of your foot)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <p className="text-[#F4F4F4]/90">Use a ruler or measuring tape to measure across this widest point</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <p className="text-[#F4F4F4]/90">Measure both feet and enter the measurements</p>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 text-lg">ℹ️</span>
                  <span className="font-semibold text-blue-400">Important</span>
        </div>
                <p className="text-sm text-[#F4F4F4]/90">We use your smaller foot width measurement to ensure a proper fit, as it's easier to create space inside a ski boot than to make it smaller.</p>
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
              setCategory("Average");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              inputType === "mm"
                ? "bg-[#F5E4D0] text-[#2B2D30]"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            My Feet
          </button>
          <button
            onClick={() => {
              setInputType("category");
              setLeftMM("");
              setRightMM("");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              inputType === "category"
                ? "bg-[#F5E4D0] text-[#2B2D30]"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Quick
          </button>
        </div>

        {inputType === "mm" ? (
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <div className="relative">
              <input
                id="leftFootWidthMM"
                name="leftFootWidthMM"
                type="number"
                value={leftMM}
                onChange={(e) => setLeftMM(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg bg-transparent text-[#F4F4F4] text-lg font-semibold focus:outline-none focus:border-[#F5E4D0] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] p-4 pr-12"
                placeholder="Left 100"
                min="50"
                max="150"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F4F4F4] pointer-events-none font-semibold">mm</span>
            </div>
            <div className="relative">
              <input
                id="rightFootWidthMM"
                name="rightFootWidthMM"
                type="number"
                value={rightMM}
                onChange={(e) => setRightMM(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg bg-transparent text-[#F4F4F4] text-lg font-semibold focus:outline-none focus:border-[#F5E4D0] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] p-4 pr-12"
                placeholder="Right 98"
                min="50"
                max="150"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F4F4F4] pointer-events-none font-semibold">mm</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center w-full max-w-md">
            <button
              onClick={() => setCategory("Narrow")}
              className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
                category === "Narrow"
                  ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg font-semibold">Narrow</span>
            </button>
            <button
              onClick={() => setCategory("Average")}
              className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
                category === "Average"
                  ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg font-semibold">Average</span>
            </button>
            <button
              onClick={() => setCategory("Wide")}
              className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
                category === "Wide"
                  ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg font-semibold">Wide</span>
            </button>
          </div>
        )}
      </div>
    </QuizStepLayout>
  );
}

export default QuizStepFootWidth;
