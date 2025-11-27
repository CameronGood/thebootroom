"use client";

import { useState } from "react";
import { BootType } from "@/types";
import HelpModal from "./HelpModal";
import QuizStepLayout from "./QuizStepLayout";

interface Props {
  value?: BootType;
  onChange: (value: BootType) => void;
  onNext: (value: BootType) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

function QuizStepBootType({
  value,
  onChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: Props) {
  const [bootType, setBootType] = useState<BootType | undefined>(value);
  const [showCard, setShowCard] = useState(false);

  const handleSelect = (type: BootType) => {
    setBootType(type);
    onChange(type);
  };

  const handleSubmit = () => {
    if (bootType) {
      onNext(bootType);
    }
  };

  const isValid = !!bootType;

  return (
    <QuizStepLayout
      title="Ski Boot Type"
      description="Select the type of Ski Boot you are looking for."
      currentStep={currentStep}
      totalSteps={totalSteps}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="w-6 h-6 rounded-full border border-gray-300 hover:bg-gray-50 text-[#F4F4F4] inline-flex items-center justify-center font-semibold text-sm"
            title="Boot type information"
          >
            ?
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Ski Boot Types"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F5E4D0]/5 hover:bg-[#F5E4D0]/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#F5E4D0] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-[#F5E4D0] mb-1">Standard</h4>
                  <p className="text-[#F4F4F4]/90 text-sm">Traditional all-mountain design for resort skiing and everyday performance.</p>
        </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F5E4D0]/5 hover:bg-[#F5E4D0]/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#F5E4D0] mt-2 flex-shrink-0"></div>
              <div>
                  <h4 className="font-bold text-[#F5E4D0] mb-1">Freestyle</h4>
                  <p className="text-[#F4F4F4]/90 text-sm">Softer, more flexible boot built for park, jumps, and tricks.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F5E4D0]/5 hover:bg-[#F5E4D0]/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#F5E4D0] mt-2 flex-shrink-0"></div>
              <div>
                  <h4 className="font-bold text-[#F5E4D0] mb-1">Hybrid</h4>
                  <p className="text-[#F4F4F4]/90 text-sm">Versatile boot that combines downhill power with walk-mode comfort for mixed resort and backcountry use.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F5E4D0]/5 hover:bg-[#F5E4D0]/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#F5E4D0] mt-2 flex-shrink-0"></div>
              <div>
                  <h4 className="font-bold text-[#F5E4D0] mb-1">Freeride</h4>
                  <p className="text-[#F4F4F4]/90 text-sm">High-performance boot designed for aggressive skiing in challenging terrain, with enhanced stability and power transmission.</p>
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
      <div className="space-y-3 lg:space-y-4 flex flex-col items-center max-w-md mx-auto">
        <button
          onClick={() => handleSelect("Standard")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            bootType === "Standard"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Standard</span>
        </button>
        <button
          onClick={() => handleSelect("Hybrid")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            bootType === "Hybrid"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Hybrid</span>
        </button>
        <button
          onClick={() => handleSelect("Freestyle")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            bootType === "Freestyle"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Freestyle</span>
        </button>
        <button
          onClick={() => handleSelect("Freeride")}
          className={`w-full p-4 text-center border-2 rounded-lg transition min-h-[60px] ${
            bootType === "Freeride"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Freeride</span>
        </button>
      </div>
    </QuizStepLayout>
  );
}

export default QuizStepBootType;
