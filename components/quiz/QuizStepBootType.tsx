"use client";

import { useState } from "react";
import { BootType } from "@/types";
import HelpModal from "./HelpModal";
import QuizOptionButton from "./QuizOptionButton";
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
      title="Boot Type"
      description="Select the type of Ski Boot you are looking for."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      removeQuestionBottomBorder={false}
      addInputTopBorder={false}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="w-8 h-8 border border-[#F5E4D0]/10 bg-[#F4F4F4] hover:bg-[#E8D4B8] text-[#2B2D30] inline-flex items-center justify-center font-bold text-lg rounded-[4px] transition-colors"
            title="Boot type information"
          >
            ?
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Ski Boot Types"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-start gap-3 p-4 bg-[#F5E4D0]/5 hover:bg-[#F5E4D0]/10 transition-colors">
                <div className="w-2 h-2 bg-[#F5E4D0] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-[#F5E4D0] mb-1 text-base md:text-lg">Resort</h4>
                  <p className="text-[#F4F4F4]/90 text-base">Traditional all-mountain design for resort skiing and everyday performance.</p>
        </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#F5E4D0]/5 hover:bg-[#F5E4D0]/10 transition-colors">
                <div className="w-2 h-2 bg-[#F5E4D0] mt-2 flex-shrink-0"></div>
              <div>
                  <h4 className="font-bold text-[#F5E4D0] mb-1 text-base md:text-lg">Freestyle</h4>
                  <p className="text-[#F4F4F4]/90 text-base">Softer, more flexible boot built for park, jumps, and tricks.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#F5E4D0]/5 hover:bg-[#F5E4D0]/10 transition-colors">
                <div className="w-2 h-2 bg-[#F5E4D0] mt-2 flex-shrink-0"></div>
              <div>
                  <h4 className="font-bold text-[#F5E4D0] mb-1 text-base md:text-lg">Hybrid</h4>
                  <p className="text-[#F4F4F4]/90 text-base">Versatile boot that combines downhill power with walk-mode comfort for mixed resort and backcountry use.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#F5E4D0]/5 hover:bg-[#F5E4D0]/10 transition-colors">
                <div className="w-2 h-2 bg-[#F5E4D0] mt-2 flex-shrink-0"></div>
              <div>
                  <h4 className="font-bold text-[#F5E4D0] mb-1 text-base md:text-lg">Freeride</h4>
                  <p className="text-[#F4F4F4]/90 text-base">High-performance boot designed for aggressive skiing in challenging terrain, with enhanced stability and power transmission.</p>
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
      <div className="flex flex-row items-center justify-start gap-3 max-w-2xl flex-wrap">
        <QuizOptionButton active={bootType === "Standard"} onClick={() => handleSelect("Standard")}>
          Resort
        </QuizOptionButton>
        <QuizOptionButton active={bootType === "Hybrid"} onClick={() => handleSelect("Hybrid")}>
          Hybrid
        </QuizOptionButton>
        <QuizOptionButton active={bootType === "Freestyle"} onClick={() => handleSelect("Freestyle")}>
          Freestyle
        </QuizOptionButton>
        <QuizOptionButton active={bootType === "Freeride"} onClick={() => handleSelect("Freeride")}>
          Freeride
        </QuizOptionButton>
      </div>
    </QuizStepLayout>
  );
}

export default QuizStepBootType;
