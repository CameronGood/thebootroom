"use client";

import { useState, useEffect, useRef } from "react";
import { QuizAnswers } from "@/types";
import HelpModal from "./HelpModal";
import QuizStepLayout from "./QuizStepLayout";
import { convertShoeSize } from "@/lib/mondo-conversions";

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
  // Initialize shoe size with default value
  const defaultShoeSize = shoeSize?.value || 7;
  const [shoeValue, setShoeValue] = useState(defaultShoeSize.toString());
  const [showCard, setShowCard] = useState(false);
  const [isSystemDropdownOpen, setIsSystemDropdownOpen] = useState(false);
  const systemDropdownRef = useRef<HTMLDivElement>(null);
  
  // Get min/max values based on shoe system
  const getShoeSizeMinMax = () => {
    if (shoeSystem === "UK") return { min: 4, max: 12, step: 0.5 };
    if (shoeSystem === "US") return { min: 5, max: 13, step: 0.5 };
    return { min: 36.5, max: 47, step: 0.5 }; // EU
  };

  const { min: sizeMin, max: sizeMax, step: sizeStep } = getShoeSizeMinMax();
  const sliderSizeValue = shoeValue ? Math.max(sizeMin, Math.min(sizeMax, parseFloat(shoeValue) || sizeMin)) : sizeMin;
  
  // Handle slider change
  const handleSizeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFloat(e.target.value);
    // Round based on step
    const roundedValue = sizeStep === 0.5 
      ? Math.round(rawValue * 2) / 2 
      : Math.round(rawValue);
    const clampedValue = Math.max(sizeMin, Math.min(sizeMax, roundedValue));
    setShoeValue(clampedValue.toString());
  };

  // Update shoe value when system changes or when value prop changes
  useEffect(() => {
    if (shoeSize?.value) {
      setShoeValue(shoeSize.value.toString());
    }
  }, [shoeSize]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (systemDropdownRef.current && !systemDropdownRef.current.contains(event.target as Node)) {
        setIsSystemDropdownOpen(false);
      }
    };

    if (isSystemDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSystemDropdownOpen]);

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
      : shoeValue && parseFloat(shoeValue) > 0;

  return (
    <QuizStepLayout
      title="Foot Length"
      description="Measure each foot from heel to longest toe."
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
            title="How to Measure Foot Length"
          >
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-xl">💡</span>
                  <span className="font-bold text-amber-400 text-lg">Pro Tip:</span>
                  <span className="text-base text-[#F4F4F4]/90">For Performance fit measure without socks. For comfort fit measure with socks.</span>
                </div>
              </div>
              
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-96">
                  <img
                    src="/quiz/Foot Length.svg"
                    alt="How to measure foot length"
                    className="w-full h-auto max-h-[500px] object-contain border border-[#F5E4D0]/10"
                  />
                </div>
                
                <div className="flex-1">
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
              setShoeSystem("UK");
              setShoeValue("");
            }}
            className={`px-6 py-2 border-[3px] font-bold uppercase transition-all duration-200 ${
              inputType === "mm"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
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
            className={`px-6 py-2 border-[3px] font-bold uppercase transition-all duration-200 ${
              inputType === "shoe"
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
              id="leftFootMM"
              name="leftFootMM"
              type="number"
              value={leftMM}
              onChange={(e) => setLeftMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-2xl lg:text-3xl xl:text-4xl font-bold focus:outline-none text-center placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-auto min-w-[4ch] p-0"
              placeholder="268"
              min="100"
              max="400"
            />
            <span className="text-[#F4F4F4] font-bold pointer-events-none whitespace-nowrap ml-2 leading-none">mm</span>
          </div>
          <div className="relative flex-1 flex items-end justify-center border-[3px] border-[#F5E4D0] bg-[#2B2D30]/50 pl-4 pr-2 py-3 transition-all duration-200 hover:border-[#F5E4D0] focus-within:border-[#F5E4D0] focus-within:bg-[#2B2D30]/70">
            <input
              id="rightFootMM"
              name="rightFootMM"
              type="number"
              value={rightMM}
              onChange={(e) => setRightMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-2xl lg:text-3xl xl:text-4xl font-bold focus:outline-none text-center placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-auto min-w-[4ch] p-0"
              placeholder="265"
              min="100"
              max="400"
            />
            <span className="text-[#F4F4F4] font-bold pointer-events-none whitespace-nowrap ml-2 leading-none">mm</span>
          </div>
        </div>
      ) : (
          <div className="flex justify-start w-full items-stretch gap-6 flex-wrap">
            {/* Size Display and Unit Selector */}
            <div className="relative inline-flex items-center justify-center gap-3 border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-4 py-3 transition-all duration-200 hover:border-[#F5E4D0]/15 min-w-[160px]" ref={systemDropdownRef}>
              <span className="text-[#F4F4F4] text-2xl lg:text-3xl xl:text-4xl font-bold font-sans min-w-[4ch] text-right">
                {sliderSizeValue % 1 === 0 ? sliderSizeValue : sliderSizeValue.toFixed(1)}
              </span>
              <button
                type="button"
                onClick={() => setIsSystemDropdownOpen(!isSystemDropdownOpen)}
                className="px-2 py-1 bg-transparent text-[#F4F4F4] transition-all duration-200 underline decoration-[#F5E4D0] underline-offset-4 text-[#F5E4D0] font-bold hover:text-[#F5E4D0] hover:bg-[#F5E4D0]/10 text-lg lg:text-xl"
              >
                {shoeSystem}
              </button>
              {isSystemDropdownOpen && (
                <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100%+0.5rem)] flex flex-row z-50 bg-[#2B2D30] border-[3px] border-[#F5E4D0]/10 overflow-hidden shadow-lg">
                  {(["UK", "US", "EU"] as Array<"UK" | "US" | "EU">)
                    .filter((optionSystem) => optionSystem !== shoeSystem)
                    .map((optionSystem) => {
                      const handleSystemChange = (newSystem: "UK" | "US" | "EU") => {
                        // Convert current shoe size to new system
                        const currentValue = parseFloat(shoeValue) || (shoeSystem === "UK" ? 7 : shoeSystem === "US" ? 8 : 40.5);
                        const convertedValue = convertShoeSize(shoeSystem, currentValue, newSystem);
                        
                        // Use converted value if available, otherwise use default for new system
                        const newValue = convertedValue !== undefined 
                          ? convertedValue 
                          : (newSystem === "UK" ? 7 : newSystem === "US" ? 8 : 40.5);
                        
                        setShoeSystem(newSystem);
                        setIsSystemDropdownOpen(false);
                        setShoeValue(newValue.toString());
                      };

                      return (
                        <button
                          key={optionSystem}
                          type="button"
                          onClick={() => handleSystemChange(optionSystem)}
                          className="px-2 py-1 bg-transparent text-[#F4F4F4] transition-all duration-200 text-[#F5E4D0] font-bold hover:text-[#F5E4D0] hover:bg-[#F5E4D0]/10 text-lg lg:text-xl border-r-[3px] border-[#F5E4D0]/10 last:border-r-0 min-w-[60px] h-full"
                        >
                          {optionSystem}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
            
            {/* Slider */}
            <div className={`inline-flex items-center justify-center border-[3px] border-[#F5E4D0]/10 px-4 py-3 flex-1 transition-all duration-200 ${isSystemDropdownOpen ? 'ml-[140px]' : ''}`} style={{ width: '400px', minWidth: '350px' }}>
              <input
                type="range"
                min={sizeMin}
                max={sizeMax}
                step={sizeStep}
                value={sliderSizeValue}
                onChange={handleSizeSliderChange}
                className="w-full h-4 appearance-none cursor-pointer brutalist-slider"
                style={{
                  background: `linear-gradient(to right, rgba(245, 228, 208, 0.3) 0%, rgba(245, 228, 208, 0.3) ${((sliderSizeValue - sizeMin) / (sizeMax - sizeMin)) * 100}%, transparent ${((sliderSizeValue - sizeMin) / (sizeMax - sizeMin)) * 100}%, transparent 100%)`
                }}
              />
            </div>
          </div>
        )}
    </QuizStepLayout>
  );
}
