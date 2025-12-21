"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { QuizAnswers } from "@/types";
import HelpModal from "./HelpModal";
import QuizOptionButton from "./QuizOptionButton";
import QuizStepLayout from "./QuizStepLayout";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";
import DesktopMeasurementFlow from "@/components/measure/DesktopMeasurementFlow";

interface Props {
  footWidth?: QuizAnswers["footWidth"];
  onNext: (value: QuizAnswers["footWidth"]) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
  quizSessionId?: string;
}

function QuizStepFootWidth({
  footWidth,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  quizSessionId,
}: Props) {
  type FootWidthMM = { left?: number; right?: number };
  type FootWidthCategory = { category?: "Narrow" | "Average" | "Wide" };

  const footWidthMM: FootWidthMM | undefined =
    footWidth && "left" in footWidth ? (footWidth as FootWidthMM) : undefined;
  const footWidthCategory: FootWidthCategory | undefined =
    footWidth && "category" in footWidth
      ? (footWidth as FootWidthCategory)
      : undefined;

  const [inputType, setInputType] = useState<"mm" | "category">(
    footWidthMM ? "mm" : footWidthCategory ? "category" : "mm"
  );
  const [leftMM, setLeftMM] = useState(footWidthMM?.left?.toString() || "");
  const [rightMM, setRightMM] = useState(footWidthMM?.right?.toString() || "");
  const [category, setCategory] = useState<"Narrow" | "Average" | "Wide">(
    footWidthCategory?.category || "Average"
  );
  const [showCard, setShowCard] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [desktopFlow, setDesktopFlow] = useState<{
    sessionId: string;
    qrCode: string;
    url: string;
  } | null>(null);

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
      ? ((!!leftMM && parseFloat(leftMM) > 0) ||
        (!!rightMM && parseFloat(rightMM) > 0))
      : true;

  return (
    <QuizStepLayout
      title="Foot Width"
      description="Measure each foot separately across its widest point (usually across the ball of the foot)."
      currentStep={currentStep}
      totalSteps={totalSteps}
      brutalistMode={true}
      helpContent={
        <>
          <button
            onClick={() => setShowCard(!showCard)}
            className="text-[#F5E4D0] font-bold uppercase text-sm underline hover:text-[#E8D4B8] transition-colors cursor-pointer"
            title="How to measure"
          >
            MORE INFO
          </button>
          <HelpModal
            isOpen={showCard}
            onClose={() => setShowCard(false)}
            title="How to Measure Foot Width"
          >
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-[#F4F4F4]/90 text-base">Stand on a flat surface with your weight evenly distributed</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-[#F4F4F4]/90 text-base">Find the widest part of your foot (usually across the ball of your foot)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <p className="text-[#F4F4F4]/90 text-base">Use a ruler or measuring tape to measure across this widest point</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <p className="text-[#F4F4F4]/90 text-base">Measure both feet and enter the measurements</p>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 text-base md:text-lg">ℹ️</span>
                  <span className="font-semibold text-blue-400 text-base md:text-lg">Important</span>
        </div>
                <p className="text-base text-[#F4F4F4]/90">We use your smaller foot width measurement to ensure a proper fit, as it's easier to create space inside a ski boot than to make it smaller.</p>
              </div>
            </div>
          </HelpModal>
        </>
      }
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
      toggleContent={
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-3">
            <QuizOptionButton
              active={inputType === "mm"}
              onClick={() => {
                setInputType("mm");
                setCategory("Average");
              }}
            >
              Your Feet
            </QuizOptionButton>
            <QuizOptionButton
              active={inputType === "category"}
              onClick={() => {
                setInputType("category");
                setLeftMM("");
                setRightMM("");
              }}
            >
              Quick
            </QuizOptionButton>
          </div>
          {inputType === "mm" && quizSessionId && (
            <button
              onClick={async () => {
                try {
                  setMeasuring(true);
                  const createRes = await fetch(
                    "/api/measurements/create-session",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        quizSessionId,
                        sockThickness: "thin",
                      }),
                    }
                  );

                  if (!createRes.ok) {
                    const errData = await createRes.json().catch(() => ({}));
                    throw new Error(errData.error || "Failed to create session");
                  }

                  const { sessionId: measurementSessionId } =
                    await createRes.json();
                  
                  // Check if mobile or desktop
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  if (isMobile) {
                    window.location.href = `/measure/${measurementSessionId}`;
                  } else {
                    // Desktop: stay on quiz page and show QR modal
                    const qrRes = await fetch(
                      `/api/measurements/session-link?sessionId=${measurementSessionId}`
                    );
                    if (!qrRes.ok) {
                      const errData = await qrRes.json().catch(() => ({}));
                      throw new Error(errData.error || "Failed to generate QR code");
                    }
                    const qrData = await qrRes.json();
                    setDesktopFlow({
                      sessionId: measurementSessionId,
                      qrCode: qrData.qrCode,
                      url: qrData.url,
                    });
                  }
                } catch (error) {
                  console.error("Error starting measurement:", error);
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to start measurement"
                  );
                } finally {
                  setMeasuring(false);
                }
              }}
              disabled={measuring}
              className="px-4 py-2 border border-[#F5E4D0] bg-transparent text-[#F5E4D0] hover:bg-[#F5E4D0]/10 font-bold uppercase text-sm rounded-[4px] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              {measuring ? "Starting..." : "Measure for me"}
            </button>
          )}
        </div>
      }
    >
      {desktopFlow &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[20000] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl border border-[#F5E4D0]/20 bg-[#2B2D30] rounded-[8px] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5E4D0]/20">
                <h3 className="text-xl font-bold uppercase text-[#F4F4F4]">
                  Measure Your Feet
                </h3>
                <button
                  type="button"
                  onClick={() => setDesktopFlow(null)}
                  className="px-3 py-1 border border-[#F5E4D0]/20 text-[#F5E4D0] hover:bg-[#F5E4D0]/10 rounded-[4px] uppercase font-bold text-sm"
                >
                  Close
                </button>
              </div>
              <div className="p-6 bg-[#040404]">
                <DesktopMeasurementFlow
                  sessionId={desktopFlow.sessionId}
                  qrCodeUrl={desktopFlow.qrCode}
                  measurementUrl={desktopFlow.url}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
      {inputType === "mm" ? (
        <div className="flex gap-4 w-full">
          <div className="inline-flex sm:flex sm:flex-1 items-center justify-center gap-2 border border-[#F5E4D0] bg-[#2B2D30]/50 px-2 py-2 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0] focus-within:border-[#F5E4D0] focus-within:bg-[#2B2D30]/70 w-auto sm:w-full">
            <input
              id="leftFootWidthMM"
              name="leftFootWidthMM"
              type="number"
              value={leftMM}
              onChange={(e) => setLeftMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-lg font-medium focus:outline-none placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-16 px-2 py-1 text-left sm:px-2 sm:py-1"
              placeholder="100"
              min="50"
              max="150"
            />
            <span className="text-[#F4F4F4] text-lg font-medium pointer-events-none whitespace-nowrap">mm</span>
          </div>
          <div className="inline-flex sm:flex sm:flex-1 items-center justify-center gap-2 border border-[#F5E4D0] bg-[#2B2D30]/50 px-2 py-2 rounded-[4px] transition-all duration-200 hover:border-[#F5E4D0] focus-within:border-[#F5E4D0] focus-within:bg-[#2B2D30]/70 w-auto sm:w-full">
            <input
              id="rightFootWidthMM"
              name="rightFootWidthMM"
              type="number"
              value={rightMM}
              onChange={(e) => setRightMM(e.target.value)}
              className="bg-transparent text-[#F4F4F4] text-lg font-medium focus:outline-none placeholder:text-[#F4F4F4]/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] w-16 px-2 py-1 text-left sm:px-2 sm:py-1"
              placeholder="98"
              min="50"
              max="150"
            />
            <span className="text-[#F4F4F4] text-lg font-medium pointer-events-none whitespace-nowrap">mm</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 max-w-2xl">
          <button
            onClick={() => setCategory("Narrow")}
            className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
              category === "Narrow"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
            }`}
          >
            Narrow
          </button>
          <button
            onClick={() => setCategory("Average")}
            className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
              category === "Average"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
            }`}
          >
            Average
          </button>
          <button
            onClick={() => setCategory("Wide")}
            className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
              category === "Wide"
                ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
                : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
            }`}
          >
            Wide
          </button>
        </div>
      )}
    </QuizStepLayout>
  );
}

export default QuizStepFootWidth;
