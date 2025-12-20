"use client";

import { useState } from "react";
import { QuizAnswers } from "@/types";
import HelpModal from "./HelpModal";
import QuizOptionButton from "./QuizOptionButton";
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
  type FootWidthMM = { left?: number; right?: number };
  type FootWidthCategory = { category?: "Narrow" | "Average" | "Wide" };

  const footWidthMM: FootWidthMM | undefined =
    footWidth && "left" in footWidth ? (footWidth as FootWidthMM) : undefined;
  const footWidthCategory: FootWidthCategory | undefined =
    footWidth && "category" in footWidth
      ? (footWidth as FootWidthCategory)
      : undefined;

  const [inputType, setInputType] = useState<"mm" | "category">(
    footWidthMM ? "mm" : footWidthCategory ? "category" : "mm"
  );
  const [leftMM, setLeftMM] = useState(footWidthMM?.left?.toString() || "");
  const [rightMM, setRightMM] = useState(footWidthMM?.right?.toString() || "");
  const [category, setCategory] = useState<"Narrow" | "Average" | "Wide">(
    footWidthCategory?.category || "Average"
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
      ? ((!!leftMM && parseFloat(leftMM) > 0) ||
        (!!rightMM && parseFloat(rightMM) > 0))
      : true;

  return (
    <QuizStepLayout
      title="Foot Width"
      description="Measure each foot separately across its widest point (usually across the ball of the foot)."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="text-[#F5E4D0] font-bold uppercase text-sm underline hover:text-[#E8D4B8] transition-colors cursor-pointer"
            title="How to measure"
          >
            MORE INFO
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="How to Measure Foot Width"
          >
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-[#F4F4F4]/90 text-base">Stand on a flat surface with your weight evenly distributed</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-[#F4F4F4]/90 text-base">Find the widest part of your foot (usually across the ball of your foot)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <p className="text-[#F4F4F4]/90 text-base">Use a ruler or measuring tape to measure across this widest point</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <p className="text-[#F4F4F4]/90 text-base">Measure both feet and enter the measurements</p>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 text-base md:text-lg">ℹ️</span>
                  <span className="font-semibold text-blue-400 text-base md:text-lg">Important</span>
        </div>
                <p className="text-base text-[#F4F4F4]/90">We use your smaller foot width measurement to ensure a proper fit, as it's easier to create space inside a ski boot than to make it smaller.</p>
              </div>
            </div>
          </HelpModal>
        </>
      }
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
      toggleContent={
        <div className="flex gap-3">
          <QuizOptionButton
            active={inputType === "mm"}
            onClick={() => {
              setInputType("mm");
              setCategory("Average");
            }}
          >
            Your Feet
          </QuizOptionButton>
          <QuizOptionButton
            active={inputType === "category"}
            onClick={() => {
              setInputType("category");
              setLeftMM("");
              setRightMM("");
            }}
          >
            Quick
          </QuizOptionButton>
        </div>
      }
    >
      {inputType === "mm" ? (
        <div className="flex gap-4 w-full">
          <div className="inline-flex sm:flex sm:flex-1 items-center justify-center gap-2 border border-[#F5E4D0] bg-[#2B2D30]/50 px-2 py-2 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0] focus-within:border-[#F5E4D0] focus-within:bg-[#2B2D30]/70 w-auto sm:w-full">
            <input
              id="leftFootWidthMM"
              name="leftFootWidthMM"
              type="number"
              value={leftMM}
              onChange={(e) => setLeftMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-lg font-medium focus:outline-none placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-16 px-2 py-1 text-left sm:px-2 sm:py-1"
              placeholder="100"
              min="50"
              max="150"
            />
            <span className="text-[#F4F4F4] text-lg font-medium pointer-events-none whitespace-nowrap">mm</span>
          </div>
          <div className="inline-flex sm:flex sm:flex-1 items-center justify-center gap-2 border border-[#F5E4D0] bg-[#2B2D30]/50 px-2 py-2 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0] focus-within:border-[#F5E4D0] focus-within:bg-[#2B2D30]/70 w-auto sm:w-full">
            <input
              id="rightFootWidthMM"
              name="rightFootWidthMM"
              type="number"
              value={rightMM}
              onChange={(e) => setRightMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-lg font-medium focus:outline-none placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-16 px-2 py-1 text-left sm:px-2 sm:py-1"
              placeholder="98"
              min="50"
              max="150"
            />
            <span className="text-[#F4F4F4] text-lg font-medium pointer-events-none whitespace-nowrap">mm</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 max-w-2xl">
          <button
            onClick={() => setCategory("Narrow")}
            className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
              category === "Narrow"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
            }`}
          >
            Narrow
          </button>
          <button
            onClick={() => setCategory("Average")}
            className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
              category === "Average"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
            }`}
          >
            Average
          </button>
          <button
            onClick={() => setCategory("Wide")}
            className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
              category === "Wide"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
            }`}
          >
            Wide
          </button>
        </div>
      )}
    </QuizStepLayout>
  );
}

export default QuizStepFootWidth;
