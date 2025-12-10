"use client";

import { useState, useEffect } from "react";
import { Volume } from "@/types";
import QuizOptionButton from "./QuizOptionButton";
import QuizStepLayout from "./QuizStepLayout";
import HelpModal from "./HelpModal";

interface Props {
  value?: Volume;
  onNext: (value: Volume) => void;
  onBack: () => void;
  onChange?: (value: Volume) => void;
  currentStep?: number;
  totalSteps?: number;
}

function QuizStepInstepHeight({
  value,
  onNext,
  onBack,
  onChange,
  currentStep,
  totalSteps,
}: Props) {
  const volumes: { value: Volume; label: string }[] = [
    { value: "Low", label: "Low" },
    { value: "Average", label: "Average" },
    { value: "High", label: "High" },
  ];

  // Find initial slider value based on current value
  const getInitialSliderValue = (): number => {
    if (!value) return 0;
    const index = volumes.findIndex((vol) => vol.value === value);
    return index >= 0 ? index : 0;
  };

  const [sliderValue, setSliderValue] = useState<number>(getInitialSliderValue());
  const [selected, setSelected] = useState<Volume | undefined>(value);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (value) {
      const index = volumes.findIndex((vol) => vol.value === value);
      if (index >= 0) {
        setSliderValue(index);
        setSelected(value);
      }
    }
  }, [value]);

  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);
    const selectedVolume = volumes[newValue];
    setSelected(selectedVolume.value);
    onChange?.(selectedVolume.value);
  };

  const handleSubmit = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <QuizStepLayout
      title="Instep"
      description="Select the option that matches your instep height."
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
            className="w-8 h-8 border border-[#F5E4D0]/10 bg-[#F4F4F4] hover:bg-[#E8D4B8] text-[#2B2D30] inline-flex items-center justify-center font-bold text-lg rounded-[4px] transition-colors"
            title="Instep information"
          >
            ?
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Instep Height Guide"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {volumes.map((volume) => (
                <div key={volume.value} className="border border-[#F5E4D0]/10 bg-[#2B2D30]/30 p-2 md:p-3 flex flex-col rounded-[4px]">
                  <img
                    src={`/feet/Instep ${volume.label}-01.svg`}
                    alt={`${volume.label} instep`}
                    className="w-full h-auto max-h-[30vh] md:max-h-[32vh] object-contain mx-auto mb-2"
                  />
                  <div className="flex justify-center">
                    <p className="text-base text-[#F4F4F4]/90 text-left max-w-[300px] leading-relaxed">
                      <span className="font-bold text-[#F5E4D0] text-base md:text-lg">{volume.label}:</span>{" "}
                      {volume.value === "Low" && "A lower arch height at the top of your foot."}
                      {volume.value === "Average" && "A moderate arch height, typical for most people."}
                      {volume.value === "High" && "A higher arch height, creating more volume at the top of your foot."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </HelpModal>
        </>
      }
    >
      <div className="flex flex-row items-center justify-start gap-3 max-w-2xl flex-wrap">
        {volumes.map((volume, index) => (
          <QuizOptionButton
            key={volume.value}
            active={selected === volume.value}
            onClick={() => handleSliderChange(index)}
          >
            {volume.label}
          </QuizOptionButton>
        ))}
      </div>
    </QuizStepLayout>
  );
}

export default QuizStepInstepHeight;
