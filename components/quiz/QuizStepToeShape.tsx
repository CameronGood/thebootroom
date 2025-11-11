"use client";

import { useState, useEffect } from "react";
import { ToeShape } from "@/types";

interface Props {
  value?: ToeShape;
  onNext: (value: ToeShape) => void;
  onBack: () => void;
  onChange?: (value: ToeShape) => void;
}

export default function QuizStepToeShape({
  value,
  onNext,
  onBack,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<ToeShape | undefined>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (val: ToeShape) => {
    setSelected(val);
    onChange?.(val);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">What shape are your toes?</h2>
      <p className="text-gray-600 mb-6">
        Select the shape that best matches your toes.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => handleSelect("Round")}
          className={`w-full p-6 text-left border-2 rounded-lg transition ${
            selected === "Round"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔵</span>
            </div>
            <div>
              <span className="text-lg font-semibold block">Round</span>
              <span className="text-sm text-gray-600">
                Rounded toe box shape
              </span>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleSelect("Square")}
          className={`w-full p-6 text-left border-2 rounded-lg transition ${
            selected === "Square"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⬜</span>
            </div>
            <div>
              <span className="text-lg font-semibold block">Square</span>
              <span className="text-sm text-gray-600">
                Square toe box shape
              </span>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleSelect("Angled")}
          className={`w-full p-6 text-left border-2 rounded-lg transition ${
            selected === "Angled"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔺</span>
            </div>
            <div>
              <span className="text-lg font-semibold block">Angled</span>
              <span className="text-sm text-gray-600">
                Angled/tapered toe box shape
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
