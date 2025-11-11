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
      <h2 className="text-2xl font-bold mb-4">
        Do you need touring capability?
      </h2>
      <p className="text-gray-600 mb-6">
        Touring boots have walk mode for hiking uphill.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => handleSelect("Yes")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Yes"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Yes</span>
          <p className="text-sm text-gray-600 mt-1">
            I need boots with walk mode for touring
          </p>
        </button>
        <button
          onClick={() => handleSelect("No")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "No"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">No</span>
          <p className="text-sm text-gray-600 mt-1">
            I only ski at resorts, no touring needed
          </p>
        </button>
      </div>
      <div className="mt-6 flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
