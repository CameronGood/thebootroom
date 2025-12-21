"use client";

import { MeasurementSessionStatus, MeasurementResult } from "@/types";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

interface MeasurementStatusProps {
  status: MeasurementSessionStatus;
  photoNumber?: 1 | 2;
  left?: MeasurementResult;
  right?: MeasurementResult;
  errorMessage?: string;
  retakeReason?: string;
}

export default function MeasurementStatus({
  status,
  photoNumber,
  left,
  right,
  errorMessage,
  retakeReason,
}: MeasurementStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "failed":
        return <XCircle className="w-6 h-6 text-red-400" />;
      case "processing":
        return <Loader2 className="w-6 h-6 text-[#F5E4D0] animate-spin" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "idle":
        return "Ready to start";
      case "capturing":
        return photoNumber ? `Capturing photo ${photoNumber} of 2...` : "Capturing...";
      case "processing":
        return photoNumber ? `Processing photo ${photoNumber}...` : "Processing...";
      case "complete":
        return "Measurement complete!";
      case "failed":
        return errorMessage || "Measurement failed";
      default:
        return "Unknown status";
    }
  };

  return (
    <div className="space-y-4">
      {status !== "idle" && (
        <div className="flex items-center gap-3 border border-[#F5E4D0]/20 bg-[#2B2D30]/50 px-4 py-3 rounded-[4px]">
          {getStatusIcon()}
          <span className="text-[#F4F4F4] font-medium">{getStatusText()}</span>
        </div>
      )}

      {retakeReason && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-[4px]">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-400 mb-1">
                Retake Required
              </p>
              <p className="text-[#F4F4F4]/90 text-sm">{retakeReason}</p>
            </div>
          </div>
        </div>
      )}

      {status === "complete" && (left || right) && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-[#F4F4F4] uppercase">
            Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {left && (
              <div className="border border-[#F5E4D0]/20 bg-[#2B2D30]/50 p-4 rounded-[4px]">
                <h4 className="font-semibold text-[#F5E4D0] mb-2">Left Foot</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-[#F4F4F4]">
                    Length: <span className="font-bold">{left.lengthMm}mm</span>
                  </p>
                  <p className="text-[#F4F4F4]">
                    Width: <span className="font-bold">{left.widthMm}mm</span>
                  </p>
                  <p className="text-[#F4F4F4]/70">
                    Confidence:{" "}
                    <span className="font-medium">
                      {Math.round(left.confidence * 100)}%
                    </span>
                  </p>
                </div>
              </div>
            )}
            {right && (
              <div className="border border-[#F5E4D0]/20 bg-[#2B2D30]/50 p-4 rounded-[4px]">
                <h4 className="font-semibold text-[#F5E4D0] mb-2">Right Foot</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-[#F4F4F4]">
                    Length:{" "}
                    <span className="font-bold">{right.lengthMm}mm</span>
                  </p>
                  <p className="text-[#F4F4F4]">
                    Width: <span className="font-bold">{right.widthMm}mm</span>
                  </p>
                  <p className="text-[#F4F4F4]/70">
                    Confidence:{" "}
                    <span className="font-medium">
                      {Math.round(right.confidence * 100)}%
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

