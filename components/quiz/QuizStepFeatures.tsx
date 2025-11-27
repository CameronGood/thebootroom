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
      <h2 className="text-4xl font-bold mb-12 text-center"><span className="text-5xl">[</span> Additional Features <span className="text-5xl">]</span></h2>
      <p className="text-[#F4F4F4] mb-12 text-lg text-center">
        Select any additional features you need (optional).
      </p>
      <div className="space-y-4 mb-6">
        <button
          onClick={() => toggleFeature("Walk Mode")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            features.includes("Walk Mode")
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Walk Mode</span>
          <p className="text-sm text-[#F4F4F4] mt-1">
            Allows easier walking when not skiing
          </p>
        </button>
        <button
          onClick={() => toggleFeature("Rear Entry")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            features.includes("Rear Entry")
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Rear Entry</span>
          <p className="text-sm text-[#F4F4F4] mt-1">
            Boot opens from the back for easier entry
          </p>
        </button>
        <button
          onClick={() => toggleFeature("Calf Adjustment")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            features.includes("Calf Adjustment")
              ? "border-[#F5E4D0] bg-[#F5E4D0]/20"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Calf Adjustment</span>
          <p className="text-sm text-[#F4F4F4] mt-1">
            Adjustable calf volume for better fit
          </p>
        </button>
      </div>
      <div className="mt-12 flex gap-4 justify-end">
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
          className="px-6 py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Spinner size="sm" />}
          {loading ? "Finding your boots..." : "Get Results"}
        </button>
      </div>
    </div>
  );
}
