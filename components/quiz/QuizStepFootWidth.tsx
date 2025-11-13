"use client";

import { useState } from "react";
import { QuizAnswers } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
    "left" in (footWidth || {})
      ? "mm"
      : "category" in (footWidth || {})
        ? "category"
        : "mm"
  );
  const [leftMM, setLeftMM] = useState(
    "left" in (footWidth || {}) ? footWidth?.left?.toString() || "" : ""
  );
  const [rightMM, setRightMM] = useState(
    "left" in (footWidth || {}) ? footWidth?.right?.toString() || "" : ""
  );
  const [category, setCategory] = useState<"Narrow" | "Average" | "Wide">(
    "category" in (footWidth || {})
      ? footWidth?.category || "Average"
      : "Average"
  );
  const [showCard, setShowCard] = useState(false);

  const handleSubmit = () => {
    if (inputType === "mm") {
      const left = leftMM ? parseFloat(leftMM) : undefined;
      const right = rightMM ? parseFloat(rightMM) : undefined;
      if (left || right) {
        // Only send mm values, explicitly exclude category
        onNext({ left, right });
      }
    } else {
      // Only send category, explicitly exclude mm values
      onNext({ category });
    }
  };

  const isValid =
    inputType === "mm"
      ? (leftMM && parseFloat(leftMM) > 0) ||
        (rightMM && parseFloat(rightMM) > 0)
      : true;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Foot Width</h2>
        <p className="text-gray-600 mb-4">
          Measure across the widest part of each foot.
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
              // Clear category value when switching to mm
              setCategory("Average");
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
              setInputType("category");
              // Clear mm values when switching to category
              setLeftMM("");
              setRightMM("");
            }}
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
              <label
                htmlFor="leftFootWidthMM"
                className="block text-sm font-medium mb-2"
              >
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
              <label
                htmlFor="rightFootWidthMM"
                className="block text-sm font-medium mb-2"
              >
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
              <p className="text-sm text-gray-600 mt-1">Standard foot width</p>
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
                <CardTitle>How to Measure Foot Width</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Stand on a flat surface with your weight evenly distributed</li>
                  <li>Find the widest part of your foot (usually across the ball of your foot)</li>
                  <li>Use a ruler or measuring tape to measure across this widest point</li>
                  <li>Measure both feet and enter the measurements</li>
                  <li>We'll use the smaller width to ensure a proper fit</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Tip:</strong> It's easier to create space inside a
                    ski boot than to make it smaller, so we use your smaller
                    foot width measurement.
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
