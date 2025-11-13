"use client";

import { useState, useEffect } from "react";
import { Gender } from "@/types";

interface Props {
  value?: Gender;
  onNext: (value: Gender) => void;
  onChange?: (value: Gender) => void;
}

export default function QuizStepGender({ value, onNext, onChange }: Props) {
  const [selected, setSelected] = useState<Gender | undefined>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (val: Gender) => {
    setSelected(val);
    onChange?.(val);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Anatomy</h2>
      <p className="text-gray-600 mb-6">
        Select the anatomy that best matches your lower leg and foot shape.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => handleSelect("Male")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Male"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Male</span>
        </button>
        <button
          onClick={() => handleSelect("Female")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            selected === "Female"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Female</span>
        </button>
      </div>
      <div className="mt-6">
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
