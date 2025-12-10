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

  // Clamp weight to max when gender or unit changes
  useEffect(() => {
    const maxKg = gender === "Male" ? 170 : 130;
    const maxLbs = gender === "Male" ? 375 : 287; // 130kg ≈ 286.6lbs, rounded
    const maxSt = gender === "Male" ? 27 : 21;   // 130kg ≈ 20.5st, rounded
    const minKg = gender === "Male" ? 45 : 35;
    const minLbs = gender === "Male" ? 99 : 77;  // 35kg ≈ 77.2lbs, rounded
    const minSt = gender === "Male" ? 7 : 6;     // 35kg ≈ 5.5st, rounded
    
    const currentMin = unit === "kg" ? minKg : unit === "lbs" ? minLbs : minSt;
    const currentMax = unit === "kg" ? maxKg : unit === "lbs" ? maxLbs : maxSt;
    
    const currentWeight = parseFloat(weight);
    if (currentWeight && currentWeight > currentMax) {
      setWeight(currentMax.toString());
    } else if (currentWeight && currentWeight < currentMin) {
      setWeight(currentMin.toString());
    }
  }, [gender, unit]);

  // Get min/max values based on unit and gender
  const getMinMax = () => {
    const maxKg = gender === "Male" ? 170 : 130;
    const maxLbs = gender === "Male" ? 375 : 287; // 130kg ≈ 286.6lbs
    const maxSt = gender === "Male" ? 27 : 21; // 130kg ≈ 20.5st
    const minKg = gender === "Male" ? 45 : 35;
    const minLbs = gender === "Male" ? 99 : 77; // 35kg ≈ 77.2lbs
    const minSt = gender === "Male" ? 7 : 6; // 35kg ≈ 5.5st
    
    if (unit === "kg") return { min: minKg, max: maxKg };
    if (unit === "lbs") return { min: minLbs, max: maxLbs };
    return { min: minSt, max: maxSt }; // stone
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
      // Use setTimeout to ensure click handlers fire first
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
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
      description="Use the slider to adjust your weight."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onNext={handleSubmit}
      isValid={!!(weight && parseFloat(weight) > 0 && parseFloat(weight) >= min)}
      noContentSpacing={true}
      brutalistMode={true}
    >
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {/* Dropdown Container */}
        <div className="flex gap-4 flex-shrink-0" ref={dropdownRef}>
          {/* Weight Display and Unit Selector */}
          <div 
            className="inline-flex items-center gap-2 border border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-4 py-3 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0]/15 cursor-pointer" 
            onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
          >
            <span className="text-[#F4F4F4] text-lg font-medium font-sans text-left w-12 inline-block overflow-hidden">
              {Math.round(parseFloat(weight) || 0)}
            </span>
            <span className="text-[#F5E4D0] font-bold text-lg underline decoration-[#F5E4D0] underline-offset-4">
              {unit}
            </span>
          </div>

          {/* Dropdown Options */}
          {isUnitDropdownOpen && (
            <>
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
                    <div
                      key={optionUnit}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitChange(optionUnit);
                      }}
                      className="inline-flex items-center justify-center border border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-4 py-3 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0] cursor-pointer"
                    >
                      <span className="text-[#F5E4D0] font-bold text-lg">{optionUnit}</span>
                    </div>
                  );
                })}
            </>
          )}
        </div>
        
        {/* Slider */}
        <div className="flex items-center justify-start border border-[#F5E4D0]/10 bg-[#2B2D30]/50 px-4 py-3 w-full sm:flex-1 sm:min-w-[300px] rounded-[4px] transition-all duration-200">
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
