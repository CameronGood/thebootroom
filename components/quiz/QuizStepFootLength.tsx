"use client";

import { useState } from "react";
import { QuizAnswers } from "@/types";

interface Props {
  footLengthMM?: { left: number; right: number };
  shoeSize?: { system: "UK" | "US" | "EU"; value: number };
  onNext: (value: {
    footLengthMM?: { left: number; right: number };
    shoeSize?: { system: "UK" | "US" | "EU"; value: number };
  }) => void;
  onBack: () => void;
}

export default function QuizStepFootLength({
  footLengthMM,
  shoeSize,
  onNext,
  onBack,
}: Props) {
  const [inputType, setInputType] = useState<"mm" | "shoe">(
    footLengthMM ? "mm" : shoeSize ? "shoe" : "mm"
  );
  const [leftMM, setLeftMM] = useState(footLengthMM?.left?.toString() || "");
  const [rightMM, setRightMM] = useState(footLengthMM?.right?.toString() || "");
  const [shoeSystem, setShoeSystem] = useState<"UK" | "US" | "EU">(
    shoeSize?.system || "UK"
  );
  const [shoeValue, setShoeValue] = useState(shoeSize?.value?.toString() || "");

  const handleSubmit = () => {
    if (inputType === "mm") {
      const left = parseFloat(leftMM);
      const right = parseFloat(rightMM);
      if (left > 0 && right > 0) {
        onNext({ footLengthMM: { left, right } });
      }
    } else {
      const value = parseFloat(shoeValue);
      if (value > 0) {
        onNext({ shoeSize: { system: shoeSystem, value } });
      }
    }
  };

  const isValid =
    inputType === "mm"
      ? leftMM && rightMM && parseFloat(leftMM) > 0 && parseFloat(rightMM) > 0
      : shoeValue && shoeValue !== "" && parseFloat(shoeValue) > 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">What is your foot length?</h2>
      <p className="text-gray-600 mb-6">
        We'll use the larger foot to recommend your mondo size.
      </p>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setInputType("mm")}
            className={`px-4 py-2 rounded-lg ${
              inputType === "mm"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Millimeters (mm)
          </button>
          <button
            onClick={() => setInputType("shoe")}
            className={`px-4 py-2 rounded-lg ${
              inputType === "shoe"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Shoe Size
          </button>
        </div>

        {inputType === "mm" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="leftFootMM" className="block text-sm font-medium mb-2">
                Left Foot (mm)
              </label>
              <input
                id="leftFootMM"
                name="leftFootMM"
                type="number"
                value={leftMM}
                onChange={(e) => setLeftMM(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., 270"
                min="100"
                max="400"
              />
            </div>
            <div>
              <label htmlFor="rightFootMM" className="block text-sm font-medium mb-2">
                Right Foot (mm)
              </label>
              <input
                id="rightFootMM"
                name="rightFootMM"
                type="number"
                value={rightMM}
                onChange={(e) => setRightMM(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., 270"
                min="100"
                max="400"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="shoeSystem" className="block text-sm font-medium mb-2">
                Shoe Size System
              </label>
              <select
                id="shoeSystem"
                name="shoeSystem"
                value={shoeSystem}
                onChange={(e) =>
                  setShoeSystem(e.target.value as "UK" | "US" | "EU")
                }
                className="w-full p-3 border rounded-lg"
              >
                <option value="UK">UK</option>
                <option value="US">US</option>
                <option value="EU">EU</option>
              </select>
            </div>
            <div>
              <label htmlFor="shoeSize" className="block text-sm font-medium mb-2">Size</label>
              <select
                id="shoeSize"
                name="shoeSize"
                value={shoeValue}
                onChange={(e) => setShoeValue(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select size</option>
                {Array.from({ length: 17 }, (_, i) => {
                  const size = 4 + i * 0.5;
                  return (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

