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
      brutalistMode={true}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="w-8 h-8 border-[3px] border-[#F5E4D0]/10 hover:bg-[#F5E4D0]/10 text-[#F4F4F4] inline-flex items-center justify-center font-bold text-lg"
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
      toggleContent={
        <div className="flex gap-3">
          <button
            onClick={() => {
              setInputType("mm");
              setCategory("Average");
            }}
            className={`px-6 py-2 border-[3px] font-bold uppercase transition-all duration-200 ${
              inputType === "mm"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
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
            className={`px-6 py-2 border-[3px] font-bold uppercase transition-all duration-200 ${
              inputType === "category"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
            }`}
          >
            Quick
          </button>
        </div>
      }
    >
      {inputType === "mm" ? (
        <div className="flex gap-4 w-full items-stretch">
          <div className="relative flex-1 flex items-end justify-center border-[3px] border-[#F5E4D0] bg-[#2B2D30]/50 pl-4 pr-2 py-3 transition-all duration-200 hover:border-[#F5E4D0] focus-within:border-[#F5E4D0] focus-within:bg-[#2B2D30]/70">
            <input
              id="leftFootWidthMM"
              name="leftFootWidthMM"
              type="number"
              value={leftMM}
              onChange={(e) => setLeftMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-2xl lg:text-3xl xl:text-4xl font-bold focus:outline-none text-center placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-auto min-w-[4ch] p-0"
              placeholder="100"
              min="50"
              max="150"
            />
            <span className="text-[#F4F4F4] font-bold pointer-events-none whitespace-nowrap ml-2 leading-none">mm</span>
          </div>
          <div className="relative flex-1 flex items-end justify-center border-[3px] border-[#F5E4D0] bg-[#2B2D30]/50 pl-4 pr-2 py-3 transition-all duration-200 hover:border-[#F5E4D0] focus-within:border-[#F5E4D0] focus-within:bg-[#2B2D30]/70">
            <input
              id="rightFootWidthMM"
              name="rightFootWidthMM"
              type="number"
              value={rightMM}
              onChange={(e) => setRightMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-2xl lg:text-3xl xl:text-4xl font-bold focus:outline-none text-center placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-auto min-w-[4ch] p-0"
              placeholder="98"
              min="50"
              max="150"
            />
            <span className="text-[#F4F4F4] font-bold pointer-events-none whitespace-nowrap ml-2 leading-none">mm</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-start gap-4 max-w-2xl flex-wrap">
            <button
              onClick={() => setCategory("Narrow")}
              className={`px-6 py-3 border-[3px] font-bold uppercase transition-all duration-200 ${
                category === "Narrow"
                  ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                  : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
              }`}
            >
              Narrow
            </button>
            <button
              onClick={() => setCategory("Average")}
              className={`px-6 py-3 border-[3px] font-bold uppercase transition-all duration-200 ${
                category === "Average"
                  ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                  : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
              }`}
            >
              Average
            </button>
            <button
              onClick={() => setCategory("Wide")}
              className={`px-6 py-3 border-[3px] font-bold uppercase transition-all duration-200 ${
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
