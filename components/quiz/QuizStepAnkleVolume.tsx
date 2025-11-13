"use client";

import { useState } from "react";
import { Volume } from "@/types";

interface Props {
  value?: Volume;
  onChange: (value: Volume) => void;
  onNext: (value: Volume) => void;
  onBack: () => void;
}

export default function QuizStepAnkleVolume({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<Volume | undefined>(value);

  const handleSelect = (val: Volume) => {
    setSelected(val);
    onChange(val);
  };

  const handleSubmit = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ankle</h2>
      <p className="text-gray-600 mb-6">
        Select the photo that best matches your ankle.
      </p>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect("Low")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Low"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Low</span>
        </button>
        <button
          onClick={() => handleSelect("Medium")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Medium"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Medium</span>
        </button>
        <button
          onClick={() => handleSelect("High")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "High"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">High</span>
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
          onClick={handleSubmit}
          disabled={!selected}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

