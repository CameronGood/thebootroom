"use client";

import { useState, useEffect, useRef } from "react";
import QuizStepLayout from "./QuizStepLayout";

interface Props {
  value?: number;
  gender?: "Male" | "Female";
  onNext: (value: number) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function QuizStepWeight({ value, gender, onNext, onBack, currentStep, totalSteps }: Props) {
  // Initialize weight in current unit
  const initializeWeight = (weightKg: number, currentUnit: "kg" | "lbs" | "st") => {
    if (currentUnit === "kg") return weightKg.toString();
    if (currentUnit === "lbs") return Math.round(weightKg / 0.453592).toString();
    return Math.round(weightKg / 6.35029).toString();
  };
  
  // Set default weight based on gender: 80kg for Male, 60kg for Female
  const getDefaultWeightKg = () => {
    if (value) return value;
    if (gender === "Male") return 80;
    if (gender === "Female") return 60;
    return 70;
  };
  
  const defaultWeightKg = getDefaultWeightKg();
  const [unit, setUnit] = useState<"kg" | "lbs" | "st">("kg");
  const [weight, setWeight] = useState(() => initializeWeight(defaultWeightKg, "kg"));
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Update weight when value prop changes (from saved data) or unit changes
  useEffect(() => {
    if (value) {
      const convertedWeight = initializeWeight(value, unit);
      setWeight(convertedWeight);
    } else if (gender) {
      const newDefaultKg = gender === "Male" ? 80 : 60;
      const convertedWeight = initializeWeight(newDefaultKg, unit);
      setWeight(convertedWeight);
    }
  }, [value, unit, gender]);

  // Get min/max values based on unit
  const getMinMax = () => {
    if (unit === "kg") return { min: 45, max: 200 };
    if (unit === "lbs") return { min: 99, max: 440 };
    return { min: 7, max: 31 }; // stone
  };

  const { min, max } = getMinMax();
  const sliderValue = weight ? Math.max(min, Math.min(max, parseFloat(weight) || min)) : min;
  
  // Handle slider change with reduced sensitivity (step of 5)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseInt(e.target.value);
    // Round to nearest 5 for reduced sensitivity
    const roundedValue = Math.round(rawValue / 5) * 5;
    const clampedValue = Math.max(min, Math.min(max, roundedValue));
    setWeight(clampedValue.toString());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUnitDropdownOpen(false);
      }
    };

    if (isUnitDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUnitDropdownOpen]);

  // Convert weight to kg
  const convertToKg = (weightValue: number, currentUnit: "kg" | "lbs" | "st"): number => {
    if (currentUnit === "lbs") {
      return weightValue * 0.453592; // Convert lbs to kg
    }
    if (currentUnit === "st") {
      return weightValue * 6.35029; // Convert stone to kg (1 stone = 6.35029 kg)
    }
    return weightValue; // Already in kg
  };

  // Convert weight from kg to target unit
  const convertFromKg = (weightValue: number, targetUnit: "kg" | "lbs" | "st"): number => {
    if (targetUnit === "lbs") {
      return weightValue / 0.453592;
    }
    if (targetUnit === "st") {
      return weightValue / 6.35029;
    }
    return weightValue; // Already in kg
  };

  const handleSubmit = () => {
    const weightNum = parseFloat(weight);
    if (weightNum > 0) {
      const weightInKg = convertToKg(weightNum, unit);
      onNext(weightInKg);
    }
  };

  // Convert existing value from kg to current unit for display
  const displayValue = value && unit === "lbs" ? (value / 0.453592).toFixed(1) : weight;

  return (
    <QuizStepLayout
      title="Weight"
      description="Please input your weight. This will be used to help select the boot flex."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onNext={handleSubmit}
      isValid={!!(weight && parseFloat(weight) > 0 && parseFloat(weight) >= min)}
      noContentSpacing={true}
      brutalistMode={true}
    >
      <div className="flex justify-start w-full items-stretch gap-6 flex-wrap">
        {/* Weight Display and Unit Selector */}
        <div className="relative inline-flex items-center justify-center gap-3 border-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-4 py-3 transition-all duration-200 hover:border-[#F5E4D0]/15 min-w-[140px]" ref={dropdownRef}>
          <span className="text-[#F4F4F4] text-2xl lg:text-3xl xl:text-4xl font-bold font-sans min-w-[3ch] text-right">
            {Math.round(parseFloat(weight) || 0)}
          </span>
          <button
            type="button"
            onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
            className="px-2 py-1 bg-transparent text-[#F4F4F4] transition-all duration-200 underline decoration-[#F5E4D0] underline-offset-4 text-[#F5E4D0] font-bold hover:text-[#F5E4D0] hover:bg-[#F5E4D0]/10 text-lg lg:text-xl"
          >
            {unit}
          </button>
          {isUnitDropdownOpen && (
            <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100%+0.5rem)] flex flex-row z-50 bg-[#2B2D30] border-[3px] border-[#F5E4D0]/10 overflow-hidden shadow-lg">
              {(["kg", "lbs", "st"] as Array<"kg" | "lbs" | "st">)
                .filter((optionUnit) => optionUnit !== unit)
                .map((optionUnit) => {
                  const handleUnitChange = (newUnit: "kg" | "lbs" | "st") => {
                    if (weight) {
                      const currentWeight = parseFloat(weight);
                      const weightInKg = convertToKg(currentWeight, unit);
                      const convertedWeight = convertFromKg(weightInKg, newUnit);
                      setWeight(Math.round(convertedWeight).toString());
                    }
                    setUnit(newUnit);
                    setIsUnitDropdownOpen(false);
                  };

                  return (
                    <button
                      key={optionUnit}
                      type="button"
                      onClick={() => handleUnitChange(optionUnit)}
                      className="px-2 py-1 bg-transparent text-[#F4F4F4] transition-all duration-200 text-[#F5E4D0] font-bold hover:text-[#F5E4D0] hover:bg-[#F5E4D0]/10 text-lg lg:text-xl border-r-[3px] border-[#F5E4D0]/10 last:border-r-0 min-w-[60px] h-full"
                    >
                      {optionUnit}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
        
        {/* Slider */}
        <div className={`inline-flex items-center justify-center border-[3px] border-[#F5E4D0]/10 px-4 py-3 flex-1 transition-all duration-200 ${isUnitDropdownOpen ? 'ml-[140px]' : ''}`} style={{ width: '400px', minWidth: '350px' }}>
          <input
            type="range"
            min={min}
            max={max}
            step="5"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-4 appearance-none cursor-pointer brutalist-slider"
            style={{
              background: `linear-gradient(to right, rgba(245, 228, 208, 0.3) 0%, rgba(245, 228, 208, 0.3) ${((sliderValue - min) / (max - min)) * 100}%, transparent ${((sliderValue - min) / (max - min)) * 100}%, transparent 100%)`
            }}
          />
        </div>
      </div>
    </QuizStepLayout>
  );
}
