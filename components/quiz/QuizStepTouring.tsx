"use client";

import { useState, useEffect } from "react";
import { Touring } from "@/types";

interface Props {
  value?: Touring;
  onNext: (value: Touring) => void;
  onBack: () => void;
  onChange?: (value: Touring) => void;
}

export default function QuizStepTouring({
  value,
  onNext,
  onBack,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<Touring | undefined>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (val: Touring) => {
    setSelected(val);
    onChange?.(val);
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-12 text-center">
        <span className="text-5xl">[</span> Do you need touring capability? <span className="text-5xl">]</span>
      </h2>
      <p className="text-[#F4F4F4] mb-12 text-lg text-center">
        Touring boots have walk mode for hiking uphill.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => handleSelect("Yes")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Yes"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Yes</span>
          <p className="text-sm text-[#F4F4F4] mt-1">
            I need boots with walk mode for touring
          </p>
        </button>
        <button
          onClick={() => handleSelect("No")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "No"
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">No</span>
          <p className="text-sm text-[#F4F4F4] mt-1">
            I only ski at resorts, no touring needed
          </p>
        </button>
      </div>
      <div className="mt-12 flex gap-4 justify-end">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="px-6 py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
