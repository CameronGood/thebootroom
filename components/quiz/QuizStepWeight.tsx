"use client";

import { useState } from "react";

interface Props {
  value?: number;
  onNext: (value: number) => void;
  onBack: () => void;
}

export default function QuizStepWeight({ value, onNext, onBack }: Props) {
  const [weight, setWeight] = useState(value?.toString() || "");

  const handleSubmit = () => {
    const weightNum = parseFloat(weight);
    if (weightNum > 0) {
      onNext(weightNum);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">What is your weight?</h2>
      <p className="text-gray-600 mb-6">
        Your weight helps us determine the appropriate boot flex for you.
      </p>
      <div className="mb-6">
        <label htmlFor="weightKG" className="block text-sm font-medium mb-2">Weight (kg)</label>
        <input
          id="weightKG"
          name="weightKG"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="e.g., 75"
          min="30"
          max="200"
          step="0.1"
        />
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
          disabled={!weight || parseFloat(weight) <= 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

