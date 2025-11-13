"use client";

import { useState, useEffect } from "react";
import { Volume } from "@/types";

interface Props {
  value?: Volume;
  onNext: (value: Volume) => void;
  onBack: () => void;
  onChange?: (value: Volume) => void;
}

export default function QuizStepCalfVolume({
  value,
  onNext,
  onBack,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<Volume | undefined>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (val: Volume) => {
    setSelected(val);
    onChange?.(val);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Calf</h2>
      <p className="text-gray-600 mb-6">
        Select the photo that best matches your calf / lower leg.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => handleSelect("Low")}
          className={`w-full p-6 text-left border-2 rounded-lg transition ${
            selected === "Low"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📏</span>
            </div>
            <div>
              <span className="text-lg font-semibold block">Low</span>
              <span className="text-sm text-gray-600">
                Slim or narrow calves
              </span>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleSelect("Medium")}
          className={`w-full p-6 text-left border-2 rounded-lg transition ${
            selected === "Medium"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📐</span>
            </div>
            <div>
              <span className="text-lg font-semibold block">Medium</span>
              <span className="text-sm text-gray-600">Average calf volume</span>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleSelect("High")}
          className={`w-full p-6 text-left border-2 rounded-lg transition ${
            selected === "High"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <span className="text-lg font-semibold block">High</span>
              <span className="text-sm text-gray-600">
                Large or muscular calves
              </span>
            </div>
          </div>
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
