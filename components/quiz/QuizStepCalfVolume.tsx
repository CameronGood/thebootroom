"use client";

import { useState, useEffect } from "react";
import { Volume } from "@/types";
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

function QuizStepCalfVolume({
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
      title="Calf"
      description="Select the image that best matches your calf / lower leg."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onNext={handleSubmit}
      isValid={!!selected}
      brutalistMode={true}
      nextButtonText="Get Results"
      noContentSpacing={true}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="w-8 h-8 border-[3px] border-[#F5E4D0]/10 hover:bg-[#F5E4D0]/10 text-[#F4F4F4] inline-flex items-center justify-center font-bold text-lg"
            title="Calf information"
          >
            ?
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="Calf Volume Guide"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {volumes.map((volume) => (
                <div key={volume.value} className="border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/30 p-6 flex flex-col">
                  <img
                    src={`/quiz/Calf ${volume.label}.svg`}
                    alt={`${volume.label} calf`}
                    className="w-full max-w-[350px] h-auto max-h-72 object-contain mx-auto mb-0"
                  />
                  <div className="flex justify-center">
                    <p className="text-base text-[#F4F4F4]/90 text-left max-w-[300px]">
                      <span className="font-bold text-[#F5E4D0]">{volume.label}:</span>{" "}
                      {volume.value === "Low" && "A smaller calf circumference, creating less volume around your lower leg."}
                      {volume.value === "Average" && "A moderate calf circumference, typical for most people."}
                      {volume.value === "High" && "A larger calf circumference, creating more volume around your lower leg."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </HelpModal>
        </>
      }
    >
      <div className="flex flex-row items-center justify-start gap-6 max-w-2xl flex-wrap">
        {volumes.map((volume) => (
          <div key={volume.value} className="flex items-center gap-3 group">
            <span
              onClick={() => {
                const index = volumes.findIndex((v) => v.value === volume.value);
                if (index >= 0) {
                  handleSliderChange(index);
                }
              }}
              className={`text-lg font-medium cursor-pointer transition-colors ${
                selected === volume.value ? "text-[#F5E4D0]" : "text-[#F4F4F4] hover:text-[#F5E4D0]/70"
              }`}
            >
              {volume.label}
            </span>
            <input
              type="checkbox"
              checked={selected === volume.value}
              onChange={() => {
                const index = volumes.findIndex((v) => v.value === volume.value);
                if (index >= 0) {
                  handleSliderChange(index);
                }
              }}
              className="w-5 h-5 rounded border-2 border-[#F5E4D0]/50 bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer transition-all checked:bg-[#F5E4D0] checked:border-[#F5E4D0]"
            />
          </div>
        ))}
      </div>
    </QuizStepLayout>
  );
}

export default QuizStepCalfVolume;
