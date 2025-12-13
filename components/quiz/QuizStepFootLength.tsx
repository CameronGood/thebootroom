"use client";

import { useState, useEffect, useRef } from "react";
import { QuizAnswers } from "@/types";
import HelpModal from "./HelpModal";
import QuizOptionButton from "./QuizOptionButton";
import QuizStepLayout from "./QuizStepLayout";
import { convertShoeSize } from "@/lib/mondo-conversions";

interface Props {
  footLengthMM?: { left: number; right: number };
  shoeSize?: { system: "UK" | "US" | "EU"; value: number };
  gender?: "Male" | "Female";
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
  gender,
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
  // Initialize shoe size with default value based on gender
  const getDefaultShoeSize = () => {
    if (shoeSize?.value) return shoeSize.value;
    // Default to UK 9 for men, UK 6 for women
    return gender === "Male" ? 9 : gender === "Female" ? 6 : 7;
  };
  const [shoeValue, setShoeValue] = useState(getDefaultShoeSize().toString());
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
  
  // Initialize default shoe size when gender changes and no value is set
  useEffect(() => {
    if (gender && !shoeSize?.value && inputType === "shoe") {
      const defaultSize = getDefaultShoeSize();
      setShoeValue(defaultSize.toString());
    }
  }, [gender, inputType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (systemDropdownRef.current && !systemDropdownRef.current.contains(event.target as Node)) {
        setIsSystemDropdownOpen(false);
      }
    };

    if (isSystemDropdownOpen) {
      // Use setTimeout to ensure click handlers fire first
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
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
      ? !!leftMM && !!rightMM && parseFloat(leftMM) > 0 && parseFloat(rightMM) > 0
      : !!shoeValue && parseFloat(shoeValue) > 0;

  return (
    <QuizStepLayout
      title="Foot Length"
      description="Measure each foot separately from the back of the heel to the tip of the longest toe."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="w-8 h-8 border border-[#F5E4D0]/10 bg-[#F4F4F4] hover:bg-[#E8D4B8] text-[#2B2D30] inline-flex items-center justify-center font-bold text-lg rounded-[4px] transition-colors"
            title="How to measure"
          >
            ?
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="How to Measure Foot Length"
          >
            <div className="space-y-3 md:space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 md:p-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-base md:text-lg">💡</span>
                    <span className="font-bold text-amber-400 text-base md:text-lg">Pro Tip:</span>
                  </div>
                  <span className="text-base text-[#F4F4F4]/90">For Performance fit measure without socks. For comfort fit measure with socks.</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-full sm:w-96">
                  <img
                    src="/quiz/Foot Length.svg"
                    alt="How to measure foot length"
                    className="w-full h-auto max-h-[300px] md:max-h-[350px] object-contain border border-[#F5E4D0]/10"
                  />
                </div>
                
                <div className="flex-1 w-full">
                  <div className="space-y-2 md:space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-[#F4F4F4]/90 text-base">Place a sheet of paper on the floor so the edge is touching the book or cereal box.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-[#F4F4F4]/90 text-base">Stand on the sheet of paper with your heel against the book or cereal box.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <p className="text-[#F4F4F4]/90 text-base">Use a pen to draw a line just in front of your longest toe. Repeat for both feet.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                    <p className="text-[#F4F4F4]/90 text-base">Using a ruler, measure the distance between the start of the paper and line.</p>
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
          <QuizOptionButton
            active={inputType === "mm"}
            onClick={() => {
              setInputType("mm");
              setShoeSystem("UK");
              setShoeValue("");
            }}
          >
            My feet
          </QuizOptionButton>
          <QuizOptionButton
            active={inputType === "shoe"}
            onClick={() => {
              setInputType("shoe");
              setLeftMM("");
              setRightMM("");
              // Set default shoe size based on gender
              const defaultSize = getDefaultShoeSize();
              setShoeValue(defaultSize.toString());
              setShoeSystem("UK");
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
              id="leftFootMM"
              name="leftFootMM"
              type="number"
              value={leftMM}
              onChange={(e) => setLeftMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-lg font-medium focus:outline-none placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-20 px-2 py-1 text-left sm:px-2 sm:py-1"
              placeholder="268"
              min="100"
              max="400"
            />
            <span className="text-[#F4F4F4] text-lg font-medium pointer-events-none whitespace-nowrap">mm</span>
          </div>
          <div className="inline-flex sm:flex sm:flex-1 items-center justify-center gap-2 border border-[#F5E4D0] bg-[#2B2D30]/50 px-2 py-2 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0] focus-within:border-[#F5E4D0] focus-within:bg-[#2B2D30]/70 w-auto sm:w-full">
            <input
              id="rightFootMM"
              name="rightFootMM"
              type="number"
              value={rightMM}
              onChange={(e) => setRightMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-lg font-medium focus:outline-none placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-20 px-2 py-1 text-left sm:px-2 sm:py-1"
              placeholder="265"
              min="100"
              max="400"
            />
            <span className="text-[#F4F4F4] text-lg font-medium pointer-events-none whitespace-nowrap">mm</span>
          </div>
        </div>
      ) : (
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Dropdown Container */}
            <div className="flex gap-4 flex-shrink-0" ref={systemDropdownRef}>
              {/* Size Display and Unit Selector */}
              <div 
                className="inline-flex items-center gap-2 border border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-4 py-2 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0]/15 cursor-pointer" 
                onClick={() => setIsSystemDropdownOpen(!isSystemDropdownOpen)}
              >
                <span className="text-[#F4F4F4] text-lg font-medium font-sans text-left w-12 inline-block overflow-hidden">
                  {sliderSizeValue % 1 === 0 ? sliderSizeValue : sliderSizeValue.toFixed(1)}
                </span>
                <span className="text-[#F5E4D0] font-bold text-lg underline decoration-[#F5E4D0] underline-offset-4">
                  {shoeSystem}
                </span>
              </div>

              {/* Dropdown Options */}
              {isSystemDropdownOpen && (
                <>
                  {(["UK", "US", "EU"] as Array<"UK" | "US" | "EU">)
                    .filter((optionSystem) => optionSystem !== shoeSystem)
                    .map((optionSystem) => {
                      const handleSystemChange = (newSystem: "UK" | "US" | "EU") => {
                        // Convert current shoe size to new system
                        const currentValue = parseFloat(shoeValue) || getDefaultShoeSize();
                        const convertedValue = convertShoeSize(shoeSystem, currentValue, newSystem);
                        
                        // Use converted value if available, otherwise use default for new system based on gender
                        const defaultUK = gender === "Male" ? 9 : gender === "Female" ? 6 : 7;
                        const defaultUS = gender === "Male" ? 10 : gender === "Female" ? 7 : 8;
                        const defaultEU = gender === "Male" ? 43 : gender === "Female" ? 38 : 40.5;
                        
                        const newValue = convertedValue !== undefined 
                          ? convertedValue 
                          : (newSystem === "UK" ? defaultUK : newSystem === "US" ? defaultUS : defaultEU);
                        
                        setShoeSystem(newSystem);
                        setIsSystemDropdownOpen(false);
                        setShoeValue(newValue.toString());
                      };

                      return (
                        <div
                          key={optionSystem}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSystemChange(optionSystem);
                          }}
                          className="inline-flex items-center justify-center border border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-4 py-2 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0] cursor-pointer"
                        >
                          <span className="text-[#F5E4D0] font-bold text-lg">{optionSystem}</span>
                        </div>
                      );
                    })}
                </>
              )}
            </div>
            
            {/* Slider */}
            <div className="flex items-center justify-start border border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-4 py-2 w-full sm:flex-1 sm:min-w-[300px] rounded-[4px] transition-all duration-200">
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
