"use client";

import { useState, useEffect } from "react";
import { Feature } from "@/types";
import Spinner from "@/components/Spinner";

interface Props {
  value: Feature[];
  onNext: (value: Feature[]) => void;
  onBack: () => void;
  loading: boolean;
}

export default function QuizStepFeatures({
  value,
  onNext,
  onBack,
  loading,
}: Props) {
  const [features, setFeatures] = useState<Feature[]>(value || []);

  // Sync state with prop value when it changes (e.g., when editing a session)
  useEffect(() => {
    console.log(`[QuizStepFeatures] useEffect - value prop changed:`, value);
    if (value && Array.isArray(value)) {
      setFeatures(value);
      console.log(`[QuizStepFeatures] useEffect - Updated features state to:`, value);
    }
  }, [value]);

  const toggleFeature = (feature: Feature) => {
    const newFeatures = features.includes(feature)
      ? features.filter((f) => f !== feature)
      : [...features, feature];
    setFeatures(newFeatures);
    console.log(`[QuizStepFeatures] Feature toggled: ${feature}, Selected features:`, newFeatures);
  };

  const handleSubmit = () => {
    console.log(`[QuizStepFeatures] Submitting with features:`, features);
    onNext(features);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Additional Features</h2>
      <p className="text-gray-600 mb-6">
        Select any additional features you need (optional).
      </p>
      <div className="space-y-4 mb-6">
        <button
          onClick={() => toggleFeature("Walk Mode")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            features.includes("Walk Mode")
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Walk Mode</span>
          <p className="text-sm text-gray-600 mt-1">
            Allows easier walking when not skiing
          </p>
        </button>
        <button
          onClick={() => toggleFeature("Rear Entry")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            features.includes("Rear Entry")
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Rear Entry</span>
          <p className="text-sm text-gray-600 mt-1">
            Boot opens from the back for easier entry
          </p>
        </button>
        <button
          onClick={() => toggleFeature("Calf Adjustment")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            features.includes("Calf Adjustment")
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Calf Adjustment</span>
          <p className="text-sm text-gray-600 mt-1">
            Adjustable calf volume for better fit
          </p>
        </button>
      </div>
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Spinner size="sm" />}
          {loading ? "Finding your boots..." : "Get Results"}
        </button>
      </div>
    </div>
  );
}
