"use client";

import { useState } from "react";
import QuizStepLayout from "./QuizStepLayout";

interface Props {
  value?: number;
  onNext: (value: number) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function QuizStepWeight({ value, onNext, onBack, currentStep, totalSteps }: Props) {
  const [weight, setWeight] = useState(value?.toString() || "");

  const handleSubmit = () => {
    const weightNum = parseFloat(weight);
    if (weightNum > 0) {
      onNext(weightNum);
    }
  };

  return (
    <QuizStepLayout
      title="Weight"
      description="Please input your weight. This will be used to help select the boot flex."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onNext={handleSubmit}
      isValid={!!(weight && parseFloat(weight) > 0)}
    >
      <div className="flex flex-col items-center max-w-sm mx-auto">
        <div className="w-full relative">
            <input
              id="weightKG"
              name="weightKG"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            className="w-full p-4 pr-12 border-2 border-gray-300 rounded-lg text-center bg-transparent text-[#F4F4F4] text-lg font-semibold focus:outline-none focus:border-[#F5E4D0] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="e.g., 75"
              min="30"
              max="200"
              step="0.1"
            />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F4F4F4] pointer-events-none font-semibold">kg</span>
        </div>
      </div>
    </QuizStepLayout>
  );
}
