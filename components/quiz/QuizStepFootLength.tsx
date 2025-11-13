"use client";

import { useState } from "react";
import { QuizAnswers } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showCard, setShowCard] = useState(false);

  const handleSubmit = () => {
    if (inputType === "mm") {
      const left = parseFloat(leftMM);
      const right = parseFloat(rightMM);
      if (left > 0 && right > 0) {
        // Only send mm values, explicitly clear shoe size
        onNext({ footLengthMM: { left, right }, shoeSize: undefined });
      }
    } else {
      const value = parseFloat(shoeValue);
      if (value > 0) {
        // Only send shoe size, explicitly clear mm values
        onNext({ shoeSize: { system: shoeSystem, value }, footLengthMM: undefined });
      }
    }
  };

  const isValid =
    inputType === "mm"
      ? leftMM && rightMM && parseFloat(leftMM) > 0 && parseFloat(rightMM) > 0
      : shoeValue && shoeValue !== "" && parseFloat(shoeValue) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Foot Length</h2>
        <p className="text-gray-600 mb-4">
          Measure each foot from heel to longest toe.
        </p>
        <button
          onClick={() => setShowCard(!showCard)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 mb-4 inline-flex items-center gap-2"
        >
          How to measure <span className="font-semibold">?</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              setInputType("mm");
              // Clear shoe size values when switching to mm
              setShoeSystem("UK");
              setShoeValue("");
            }}
            className={`px-4 py-2 rounded-lg ${
              inputType === "mm"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Millimeters (mm)
          </button>
          <button
            onClick={() => {
              setInputType("shoe");
              // Clear mm values when switching to shoe size
              setLeftMM("");
              setRightMM("");
            }}
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
              <label
                htmlFor="leftFootMM"
                className="block text-sm font-medium mb-2"
              >
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
              <label
                htmlFor="rightFootMM"
                className="block text-sm font-medium mb-2"
              >
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
              <label
                htmlFor="shoeSystem"
                className="block text-sm font-medium mb-2"
              >
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
              <label
                htmlFor="shoeSize"
                className="block text-sm font-medium mb-2"
              >
                Size
              </label>
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
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex-1"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
        >
          Next
        </button>
      </div>

      {/* Card below */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>How to Measure Foot Length</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Stand on a flat surface with your weight evenly distributed</li>
                  <li>Place a ruler or measuring tape against a wall</li>
                  <li>Position your heel against the wall</li>
                  <li>Measure from the wall to the tip of your longest toe</li>
                  <li>Measure both feet and enter the measurements</li>
                  <li>We'll use the smaller foot to recommend your mondo size</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Tip:</strong> It's easier to create space inside a
                    ski boot than to make it smaller, so we use your smaller
                    foot measurement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
