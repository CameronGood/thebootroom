"use client";

import { useState } from "react";
import { BootType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  value?: BootType;
  onChange: (value: BootType) => void;
  onNext: (value: BootType) => void;
  onBack: () => void;
}

export default function QuizStepBootType({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [bootType, setBootType] = useState<BootType | undefined>(value);
  const [showCard, setShowCard] = useState(false);

  const handleSelect = (type: BootType) => {
    setBootType(type);
    onChange(type);
  };

  const handleSubmit = () => {
    if (bootType) {
      onNext(bootType);
    }
  };

  const isValid = !!bootType;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Ski Boot Type</h2>
        <p className="text-gray-600 mb-4">
          Select the type of Ski Boot you are looking for.
        </p>
        <button
          onClick={() => setShowCard(!showCard)}
          className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 mb-4 inline-flex items-center justify-center font-semibold text-lg"
          title="How to measure"
        >
          ?
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleSelect("Standard")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            bootType === "Standard"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Standard</span>
        </button>
        <button
          onClick={() => handleSelect("Freestyle")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            bootType === "Freestyle"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Freestyle</span>
        </button>
        <button
          onClick={() => handleSelect("Hybrid")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            bootType === "Hybrid"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Hybrid</span>
        </button>
        <button
          onClick={() => handleSelect("Touring")}
          className={`w-full p-4 text-left border-2 rounded-lg transition ${
            bootType === "Touring"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg font-semibold">Touring</span>
        </button>
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
                <CardTitle>Ski Boot Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Standard Ski Boot</h3>
                  <p className="text-sm text-gray-600">
                    Traditional all-mountain design for resort skiing and
                    everyday performance.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Freestyle Ski Boot</h3>
                  <p className="text-sm text-gray-600">
                    Softer, more flexible boot built for park, jumps, and
                    tricks.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Hybrid Ski Boot</h3>
                  <p className="text-sm text-gray-600">
                    Versatile boot that combines downhill power with walk-mode
                    comfort for mixed resort and backcountry use.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Touring Ski Boot</h3>
                  <p className="text-sm text-gray-600">
                    Lightweight boot with full walk mode and tech inserts for
                    uphill efficiency and backcountry touring.
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

