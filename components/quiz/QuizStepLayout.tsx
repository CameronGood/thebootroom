"use client";

import { ReactNode } from "react";

interface QuizStepLayoutProps {
  title: string;
  description: string;
  helpContent?: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  isValid: boolean;
  nextButtonText?: string;
  showBackButton?: boolean;
  children: ReactNode;
  // Mobile layout props
  currentStep?: number;
  totalSteps?: number;
  // Spacing control
  noContentSpacing?: boolean;
  // Brutalist mode (always true - kept for backward compatibility)
  brutalistMode?: boolean;
  // Custom border styling
  removeQuestionBottomBorder?: boolean;
  addInputTopBorder?: boolean;
  // Toggle section (between question and inputs)
  toggleContent?: ReactNode;
}

export default function QuizStepLayout({
  title,
  description,
  helpContent,
  onBack,
  onNext,
  isValid,
  nextButtonText = "Next",
  showBackButton = true,
  children,
  currentStep,
  totalSteps,
  noContentSpacing = false,
  brutalistMode = true,
  removeQuestionBottomBorder = false,
  addInputTopBorder = false,
  toggleContent,
}: QuizStepLayoutProps) {
  // Brutalist layout - the only version
    return (
      <div className="w-full border border-[#F5E4D0]/20 rounded-[8px] overflow-hidden">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-[#F5E4D0]/20 bg-[#2B2D30]">
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold uppercase text-[#F4F4F4] pr-8">
              {title}
            </h2>
            {helpContent && (
              <div className="absolute top-0 right-0">
                {helpContent}
              </div>
            )}
          </div>
        </div>

        {/* Question/Description Section */}
        <div className={`px-6 py-4 sm:border-r border-[#F5E4D0]/20 w-fit bg-[#2B2D30]/50 ${removeQuestionBottomBorder && !toggleContent ? '' : 'border-b border-[#F5E4D0]/20'}`}>
          <p className="text-[#F4F4F4] text-base lg:text-lg xl:text-xl text-left leading-relaxed">
            {description}
          </p>
        </div>

        {/* Toggle Section */}
        {toggleContent && (
          <div className="px-6 py-4 sm:border-r border-[#F5E4D0]/20 w-fit bg-[#2B2D30]/50">
            {toggleContent}
          </div>
        )}

        {/* Content/Input Section */}
        <div className={`px-6 py-4 sm:border-r border-[#F5E4D0]/20 bg-[#2B2D30]/50 ${toggleContent || addInputTopBorder ? 'border-t border-[#F5E4D0]/20' : ''} w-full sm:w-fit`}>
          <div className={`${noContentSpacing ? '' : 'max-h-[60vh] overflow-y-auto hide-scrollbar'}`}>
            {children}
          </div>
        </div>

        {/* Button Section */}
        <div className="px-6 py-4 border-t border-[#F5E4D0]/20 bg-[#2B2D30]/50">
          <div className="flex justify-between items-center">
            {showBackButton && onBack ? (
              <button
                onClick={onBack}
                className="px-4 py-2 border border-[#F5E4D0]/10 text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10 font-bold uppercase rounded-[4px] transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            <button
              onClick={onNext}
              disabled={!isValid}
              className="px-4 py-2 bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border border-[#F5E4D0]/10 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-bold uppercase rounded-[4px] transition-colors ml-auto"
            >
              {nextButtonText}
            </button>
          </div>
        </div>
      </div>
  );
}
