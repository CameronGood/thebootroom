"use client";

import { useState, useEffect } from "react";
import { Ability } from "@/types";

interface Props {
  value?: Ability;
  onNext: (value: Ability) => void;
  onBack: () => void;
  onChange?: (value: Ability) => void;
}

export default function QuizStepAbility({
  value,
  onNext,
  onBack,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<Ability | undefined>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (val: Ability) => {
    setSelected(val);
    onChange?.(val);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skiing Ability</h2>
      <p className="text-gray-600 mb-6">
        Select an option that best matches your ability.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => handleSelect("Beginner")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Beginner"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Beginner</span>
          <p className="text-sm text-gray-600 mt-1">
            New to skiing or still learning the basics
          </p>
        </button>
        <button
          onClick={() => handleSelect("Intermediate")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Intermediate"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Intermediate</span>
          <p className="text-sm text-gray-600 mt-1">
            Comfortable on blue runs, working on advanced techniques
          </p>
        </button>
        <button
          onClick={() => handleSelect("Advanced")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Advanced"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Advanced</span>
          <p className="text-sm text-gray-600 mt-1">
            Expert skier, comfortable on all terrain
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
