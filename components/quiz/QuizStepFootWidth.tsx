"use client";

import { useState } from "react";
import { QuizAnswers } from "@/types";

interface Props {
  footWidth?: QuizAnswers["footWidth"];
  onNext: (value: QuizAnswers["footWidth"]) => void;
  onBack: () => void;
}

export default function QuizStepFootWidth({
  footWidth,
  onNext,
  onBack,
}: Props) {
  const [inputType, setInputType] = useState<"mm" | "category">(
    "left" in (footWidth || {}) ? "mm" : "category" in (footWidth || {}) ? "category" : "mm"
  );
  const [leftMM, setLeftMM] = useState(
    "left" in (footWidth || {}) ? footWidth?.left?.toString() || "" : ""
  );
  const [rightMM, setRightMM] = useState(
    "left" in (footWidth || {}) ? footWidth?.right?.toString() || "" : ""
  );
  const [category, setCategory] = useState<"Narrow" | "Average" | "Wide">(
    "category" in (footWidth || {}) ? footWidth?.category || "Average" : "Average"
  );

  const handleSubmit = () => {
    if (inputType === "mm") {
      const left = leftMM ? parseFloat(leftMM) : undefined;
      const right = rightMM ? parseFloat(rightMM) : undefined;
      if (left || right) {
        onNext({ left, right });
      }
    } else {
      onNext({ category });
    }
  };

  const isValid =
    inputType === "mm"
      ? (leftMM && parseFloat(leftMM) > 0) || (rightMM && parseFloat(rightMM) > 0)
      : true;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">What is your foot width?</h2>
      <p className="text-gray-600 mb-6">
        This will help to match to the correct boot last width.
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
            onClick={() => setInputType("category")}
            className={`px-4 py-2 rounded-lg ${
              inputType === "category"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Category
          </button>
        </div>

        {inputType === "mm" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="leftFootWidthMM" className="block text-sm font-medium mb-2">
                Left Foot Width (mm)
              </label>
              <input
                id="leftFootWidthMM"
                name="leftFootWidthMM"
                type="number"
                value={leftMM}
                onChange={(e) => setLeftMM(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., 100"
                min="50"
                max="150"
              />
            </div>
            <div>
              <label htmlFor="rightFootWidthMM" className="block text-sm font-medium mb-2">
                Right Foot Width (mm)
              </label>
              <input
                id="rightFootWidthMM"
                name="rightFootWidthMM"
                type="number"
                value={rightMM}
                onChange={(e) => setRightMM(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., 100"
                min="50"
                max="150"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setCategory("Narrow")}
              className={`w-full p-4 text-left border-2 rounded-lg transition ${
                category === "Narrow"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg font-semibold">Narrow</span>
              <p className="text-sm text-gray-600 mt-1">
                Feet are narrower than average
              </p>
            </button>
            <button
              onClick={() => setCategory("Average")}
              className={`w-full p-4 text-left border-2 rounded-lg transition ${
                category === "Average"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg font-semibold">Average</span>
              <p className="text-sm text-gray-600 mt-1">
                Standard foot width
              </p>
            </button>
            <button
              onClick={() => setCategory("Wide")}
              className={`w-full p-4 text-left border-2 rounded-lg transition ${
                category === "Wide"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg font-semibold">Wide</span>
              <p className="text-sm text-gray-600 mt-1">
                Feet are wider than average
              </p>
            </button>
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

