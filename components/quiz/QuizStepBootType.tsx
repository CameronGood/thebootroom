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
      title="Boot Type"
      description="Select the type of Ski Boot you are looking for."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      removeQuestionBottomBorder={true}
      addInputTopBorder={true}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="w-8 h-8 border-[3px] border-[#F5E4D0]/10 hover:bg-[#F5E4D0]/10 text-[#F4F4F4] inline-flex items-center justify-center font-bold text-lg"
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
      <div className="flex flex-row items-center justify-start gap-4 max-w-2xl flex-wrap">
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
            onClick={() => handleSelect("Standard")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              bootType === "Standard" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
            }`}
          >
            Standard
          </span>
          <input
            type="checkbox"
            checked={bootType === "Standard"}
            onChange={() => handleSelect("Standard")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
            onClick={() => handleSelect("Hybrid")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              bootType === "Hybrid" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
            }`}
          >
            Hybrid
          </span>
          <input
            type="checkbox"
            checked={bootType === "Hybrid"}
            onChange={() => handleSelect("Hybrid")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
            onClick={() => handleSelect("Freestyle")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              bootType === "Freestyle" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
            }`}
          >
            Freestyle
          </span>
          <input
            type="checkbox"
            checked={bootType === "Freestyle"}
            onChange={() => handleSelect("Freestyle")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
        <div className="flex items-center gap-3 group border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 px-4 py-2">
          <span
            onClick={() => handleSelect("Freeride")}
            className={`text-lg font-medium cursor-pointer transition-colors ${
              bootType === "Freeride" ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
            }`}
          >
            Freeride
          </span>
          <input
            type="checkbox"
            checked={bootType === "Freeride"}
            onChange={() => handleSelect("Freeride")}
            className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
          />
        </div>
      </div>
    </QuizStepLayout>
  );
}

export default QuizStepBootType;
